import { Department } from "@/app/types/department";
import { Application } from "@/app/types/application";
import { ApplicationPayload } from "@/app/types/application";
import type { AppNotification } from "@/app/types/application";
import axios from "axios";
import { User } from "@/app/types/user";
import { useAuthStore } from "../store/auth";
import { useModalStore } from "../store/modal";

const api = axios.create({
	baseURL:
		(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/api/v1",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// リクエストインターセプター
api.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem("access-token");
		const client = localStorage.getItem("client");
		const uid = localStorage.getItem("uid");

		if (accessToken && client && uid) {
			config.headers["access-token"] = accessToken;
			config.headers["client"] = client;
			config.headers["uid"] = uid;
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
		if (response.headers["access-token"]) {
			localStorage.setItem("access-token", response.headers["access-token"]);
		}
		if (response.headers["client"]) {
			localStorage.setItem("client", response.headers["client"]);
		}
		if (response.headers["uid"]) {
			localStorage.setItem("uid", response.headers["uid"]);
		}
		return response;
	},
	(error) => {
		// エラーオブジェクトをより詳しくログ出力
		const errorDetails = {
			message: error.message,
			code: error.code,
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			config: {
				url: error.config?.url,
				method: error.config?.method,
			}
		};

		console.error(
			`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
			JSON.stringify(errorDetails, null, 2)
		);

		if (error.response && error.response.status === 401) {
			// ログインAPIでの401エラーはモーダル表示の対象外とする
			if (error.config.url !== "/auth/sign_in") {
				// Zustandストアのアクションを呼び出してモーダルを表示
				useModalStore.getState().showModal({
					title: "セッションタイムアウト",
					message:
						"セッションがタイムアウトしました。再度ログインしてください。",
					onConfirm: () => {
						useAuthStore.getState().clearAuth();
						localStorage.removeItem("access-token");
						localStorage.removeItem("client");
						localStorage.removeItem("uid");
						window.location.href = "/login";
						useModalStore.getState().hideModal();
					},
				});
			}
		}
		return Promise.reject(error);
	}
);

export default api;


// 操作ログの型
export interface OperationLog {
	id: number;
	user_id: number;
	user_name: string;
	action: string;
	action_label: string;
	target_type: string | null;
	target_id: number | null;
	details: any;
	ip_address: string;
	created_at: string;
}

export interface OperationLogParams {
	user_id?: number | string;
	action_type?: string;
	start_date?: string;
	end_date?: string;
	page?: number;
	per_page?: number;
}

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
	microsoft_account_id?: string;
};
export type UpdateUserParams = {
	id: number;
	name?: string;
	email?: string;
	address?: string;
	phone_number?: string;
	password?: string;
	password_confirmation?: string;
	special_reason?: string;
	department_id?: number;
	role_id?: number;
	group_id?: number;
	position?: string;
	employee_number?: string;
	manager_id?: number;
	hired_date?: string;
	microsoft_account_id?: string;
};

export const adminGetUsers = () => api.get<User[]>("/admin/users");
export const adminGetUser = (id: number) => api.get<User>(`/admin/users/${id}`);
export const adminCreateUser = (params: CreateUserParams) =>
	api.post<User>("/admin/users", { user: params });
export const adminUpdateUser = (
	id: number,
	params: Omit<UpdateUserParams, "id">
) => api.put<User>(`/admin/users/${id}`, { user: params });
export const adminDeleteUser = (id: number) => api.delete(`/admin/users/${id}`);

// プロフィールAPI
export const getProfile = () => api.get<User>("/me");
export const updateUser = (id: number, params: Omit<UpdateUserParams, "id">) =>
	api.put<User>(`/users/${id}`, { user: params });

// 週間在宅勤務上限API
export interface WeeklyLimitStatus {
	weekly_limit: number;
	weekly_count: number;
	years_of_service: number;
}
export const getWeeklyLimitStatus = () =>
	api.get<WeeklyLimitStatus>("/weekly_limit_status");

// 人事異動API
export interface UserInfoChangeParams {
	user_id: number;
	new_department_id?: number;
	new_role_id?: number;
	new_manager_id?: number;
	effective_date: string;
}
export const adminCreateInfoChange = (params: UserInfoChangeParams) =>
	api.post("/admin/user_info_changes", { user_info_change: params });

// 部署・役職API
export const getDepartments = () => api.get<Department[]>("/departments");
import { Group } from "@/app/types/user";

export const getRoles = () => api.get("/roles");
export const getGroups = () => api.get<Group[]>("/groups");
export const createDepartment = (params: { name: string }) =>
	api.post<Department>("/departments", { department: params });
export const updateDepartment = (id: number, params: { name: string }) =>
	api.put<Department>(`/departments/${id}`, { department: params });
export const deleteDepartment = (id: number) =>
	api.delete(`/departments/${id}`);

// 申請API
export type ApplicationRequestParams = {
	sort_by?: "created_at" | "start_date" | "end_date";
	sort_order?: "asc" | "desc";
	status?: string;
	user_name?: string;
	filter_by_status?: string;
	filter_by_month?: string;
	filter_by_user?: string | number;
};

export const createApplication = (
	params: ApplicationPayload,
	skipLimitCheck: boolean = false
) => {
	const payload: { application: ApplicationPayload & { skip_limit_check?: boolean } } = { application: params };
	if (skipLimitCheck) {
		payload.application.skip_limit_check = true;
	}
	return api.post("/applications", payload);
};
export const getApplications = (params: ApplicationRequestParams = {}) => {
	const query = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return api.get(`/applications?${query}`);
};
export const getApplication = (id: number) =>
	api.get<Application>(`/applications/${id}`);
export const cancelApplication = (id: number) =>
	api.delete(`/applications/${id}`);
export const adminImportUsers = (formData: FormData) => {
	return api.post("/admin/users/import_csv", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export const adminGetApplications = (params: ApplicationRequestParams = {}) => {
	const query = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return api.get(`/admin/applications?${query}`);
};
export const getApplicationStats = () => api.get("/applications/stats");
export const getRecentApplications = () => api.get("/applications/recent");
export const getCalendarApplications = (year: number, month: number) => {
	return api.get(`/applications/calendar?year=${year}&month=${month}`);
};
export const getApplicationsByDate = (date: string) => {
	return api.get(`/applications/by_date?date=${date}`);
};
// 承認API
export const getPendingApprovals = (params: ApplicationRequestParams = {}) => {
	const query = new URLSearchParams(
		params as Record<string, string>
	).toString();
	return api.get(`/approvals?${query}`);
};
export const updateApprovalStatus = (
	id: number,
	status: "approved" | "rejected",
	comment?: string
) => {
	const payload: { status: string; comment?: string } = { status };
	// commentが指定されている場合のみペイロードに含める
	if (comment !== undefined && comment !== null && comment !== "") {
		payload.comment = comment;
	}
	return api.put(`/approvals/${id}`, { approval: payload });
};
export const getPendingApprovalsCount = () => {
	return api.get("/approvals/pending_count");
};

// 通知API
export const getNotifications = () =>
	api.get<AppNotification[]>("/notifications");
export const markNotificationAsRead = (id: number) =>
	api.put<AppNotification>(`/notifications/${id}`, { read: true });
export const getUnreadNotifications = () =>
	api.get<AppNotification[]>("/notifications/unread");

// アカウント有効化API
export const checkActivation = (email: string, employee_number: string) =>
	api.post("/auth/activation/check", { email, employee_number });

export const setupAccount = (params: {
	email: string;
	employee_number: string;
	password: string;
	password_confirmation: string;
}) => api.post("/auth/activation/setup", params);

// 利用統計API
export const adminExportUsageStats = (params?: { start_date?: string; end_date?: string; department_id?: string }) =>
	api.get("/admin/usage_stats/export", { params, responseType: "blob" });


export const adminGetUsageStats = (params?: { start_date?: string; end_date?: string; department_id?: string }) =>
	api.get("/admin/usage_stats", { params });

export const adminGetDepartmentTrend = (departmentId: string) =>
	api.get(`/admin/usage_stats/department_trend?department_id=${encodeURIComponent(departmentId)}`);

export const adminGetMonthlyComparison = (month: string) =>
	api.get(`/admin/usage_stats/monthly_comparison?month=${month}`);

// 操作ログAPI
export const getOperationLogs = (params: OperationLogParams) =>
	api.get<{
		logs: OperationLog[];
		total: number;
		page: number;
		per_page: number;
	}>("/admin/operation_logs", { params });

export const exportOperationLogs = (params: OperationLogParams) =>
	api.get("/admin/operation_logs/export", { params, responseType: "blob" });
