import { Department } from '@/app/types/department';
import { ApplicationPayload } from '@/app/types/application';
import type { AppNotification } from '@/app/types/application';
import axios from 'axios';
import { User } from '@/app/types/user';
import { useAuthStore } from '../store/auth';
import { useModalStore } from '../store/modal';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',

  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

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
      localStorage.setItem('access-token', response.headers['access-token']);
    }
    if (response.headers['client']) {
      localStorage.setItem('client', response.headers['client']);
    }
    if (response.headers['uid']) {
      localStorage.setItem('uid', response.headers['uid']);
    }
    return response;
  },
  (error) => {
  	if (error.response && error.response.status === 401) {
  		// ログインAPIでの401エラーはモーダル表示の対象外とする
  		if (error.config.url !== '/auth/sign_in') {
  			// Zustandストアのアクションを呼び出してモーダルを表示
  		useModalStore.getState().showModal({
  			title: 'セッションタイムアウト',
  			message: 'セッションがタイムアウトしました。再度ログインしてください。',
  			onConfirm: () => {
  				useAuthStore.getState().clearAuth();
  				localStorage.removeItem('access-token');
  				localStorage.removeItem('client');
  				localStorage.removeItem('uid');
  				window.location.href = '/login';
  				useModalStore.getState().hideModal();
  			},
  		});
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
  hired_date?: string;
};
export type UpdateUserParams = {
  id: number;
  name?: string;
  email?: string;
  address?: string;
  phone_number?: string;
  password?: string;
  password_confirmation?: string;
  department_id?: number;
  role_id?: number;
  group_id?: number;
  position?: string;
  employee_number?: string;
  manager_id?: number;
  hired_date?: string;
};


export const adminGetUsers = () => api.get<User[]>('/admin/users');
export const adminGetUser = (id: number) => api.get<User>(`/admin/users/${id}`);
export const adminCreateUser = (params: CreateUserParams) => api.post<User>('/admin/users', { user: params });
export const adminUpdateUser = (id: number, params: Omit<UpdateUserParams, 'id'>) => api.put<User>(`/admin/users/${id}`, { user: params });
export const adminDeleteUser = (id: number) => api.delete(`/admin/users/${id}`);

// プロフィールAPI
export const getProfile = () => api.get<User>('/me');
export const updateUser = (id: number, params: Omit<UpdateUserParams, 'id'>) => api.put<User>(`/users/${id}`, { user: params });

// 人事異動API
export interface UserInfoChangeParams {
  user_id: number;
  new_department_id?: number;
  new_role_id?: number;
  new_manager_id?: number;
  effective_date: string;
}
export const adminCreateInfoChange = (params: UserInfoChangeParams) => api.post('/admin/user_info_changes', params);

// 部署・役職API
export const getDepartments = () => api.get<Department[]>('/departments');
import { Group } from '@/app/types/user';

export const getRoles = () => api.get('/roles');
export const getGroups = () => api.get<Group[]>('/groups');
export const createDepartment = (params: { name: string }) => api.post<Department>('/departments', { department: params });
export const updateDepartment = (id: number, params: { name: string }) => api.put<Department>(`/departments/${id}`, { department: params });
export const deleteDepartment = (id: number) => api.delete(`/departments/${id}`);

// 申請API
export type ApplicationRequestParams = {
  sort_by?: 'created_at' | 'date' | 'status';
  sort_order?: 'asc' | 'desc';
  filter_by_status?: string;
  filter_by_user?: string;
};

export const createApplication = (params: ApplicationPayload) => api.post('/applications', { application: params });
export const getApplications = (params: ApplicationRequestParams = {}) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get(`/applications?${query}`);
};
export const cancelApplication = (id: number) => api.delete(`/applications/${id}`);
export const adminGetApplications = (params: ApplicationRequestParams = {}) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get(`/admin/applications?${query}`);
};
export const getApplicationStats = () => api.get('/applications/stats');
export const getRecentApplications = () => api.get('/applications/recent');
// 承認API
export const getPendingApprovals = () => api.get('/approvals');
export const updateApprovalStatus = (id: number, status: 'approved' | 'rejected') => api.put(`/approvals/${id}`, { status });

// 通知API
export const getNotifications = () => api.get<AppNotification[]>('/notifications');
export const markNotificationAsRead = (id: number) => api.put<AppNotification>(`/notifications/${id}`, { read: true });