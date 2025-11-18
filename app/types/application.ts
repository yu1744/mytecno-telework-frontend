import { User } from "./user";

export interface ApplicationStatus {
	id: number;
	name: string;
}

export interface Approval {
	id: number;
	status: string;
	comment: string | null;
	approver: {
		id: number;
		name: string;
	};
}

export interface TransportRoute {
	id: number;
	name: string;
	cost: number;
}

export interface Application {
	id: number;
	date: string;
	work_style: string;
	work_option: string;
	start_time: string | null;
	end_time: string | null;
	reason: string;
	is_overtime: boolean;
	overtime_reason: string | null;
	overtime_end: string | null;
	is_special?: boolean;
	special_reason?: string | null;
	project: string | null;
	break_time: number | null;
	user: {
		id: number;
		name: string;
		transport_routes: TransportRoute[];
	};
	application_status: ApplicationStatus;
	approvals: Approval[];
	// 下記はindexアクションでのみ使用される可能性があるためoptionalにしておく
	application_status_id?: number;
	approver_comment?: string;
	created_at?: string;
	updated_at?: string;
	application_type?: string;
	work_hours_exceeded?: boolean;
}

export interface ApplicationPayload {
	date: string;
	work_option: string;
	start_time?: string;
	end_time?: string;
	is_special: boolean;
	reason: string;
	special_reason?: string;
	is_overtime: boolean;
	overtime_reason?: string;
	overtime_end?: string;
}
export interface AppNotification {
	id: number;
	user_id: number;
	message: string;
	read: boolean;
	link: string;
	created_at: string;
	updated_at: string;
}
