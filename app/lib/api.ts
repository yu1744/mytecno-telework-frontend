import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from '@/app/types/user';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('access-token');
    const client = Cookies.get('client');
    const uid = Cookies.get('uid');

    if (accessToken && client && uid) {
      config.headers['access-token'] = accessToken;
      config.headers['client'] = client;
      config.headers['uid'] = uid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    if (response.headers['access-token']) {
      Cookies.set('access-token', response.headers['access-token']);
    }
    if (response.headers['client']) {
      Cookies.set('client', response.headers['client']);
    }
    if (response.headers['uid']) {
      Cookies.set('uid', response.headers['uid']);
    }
    return response;
  },
  (error) => {
  	if (error.response && error.response.status === 401) {
  		// ログインAPIでの401エラーはモーダル表示の対象外とする
  		if (error.config.url !== '/api/v1/auth/sign_in') {
  			// Zustandストアのアクションを呼び出してモーダルを表示
  			useAuthStore.getState().showSessionTimeoutModal();
  		}
  	}
  	return Promise.reject(error);
  }
 );

export default api;

// ユーザー管理API
export type CreateUserParams = {
  email: string;
  name: string;
  employee_number: string;
  password?: string;
  password_confirmation?: string;
  role_id: number;
  department_id: number;
};
export type UpdateUserParams = Omit<User, 'id' | 'role' | 'department' | 'hired_date'>;


export const adminGetUsers = () => api.get<User[]>('/api/v1/admin/users');
export const adminCreateUser = (params: CreateUserParams) => api.post<User>('/api/v1/admin/users', { user: params });
export const adminUpdateUser = (id: number, params: UpdateUserParams) => api.put<User>(`/api/v1/admin/users/${id}`, { user: params });
export const adminDeleteUser = (id: number) => api.delete(`/api/v1/admin/users/${id}`);

// 人事異動API
export interface UserInfoChangeParams {
  user_id: number;
  new_department_id?: number;
  new_role_id?: number;
  new_manager_id?: number;
  effective_date: string;
}
export const adminCreateInfoChange = (params: UserInfoChangeParams) => api.post('/api/v1/admin/user_info_changes', params);

// 部署・役職API
export const getDepartments = () => api.get('/api/v1/departments');
export const getRoles = () => api.get('/api/v1/roles');