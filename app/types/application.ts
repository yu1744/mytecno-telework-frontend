import { User } from './user';

export interface ApplicationStatus {
  id: number;
  name: string;
}

export interface Application {
 id: number;
 date: string;
 reason: string;
 application_status_id: number;
 approver_comment?: string;
 created_at: string;
 updated_at: string;
 user: User;
 application_status?: ApplicationStatus;
 start_date: string;
 application_type: string;
 weekly_application_count: number;
 work_modality?: string;
 start_time?: string;
 end_time?: string;
 break_time?: number;
 overtime_reason?: string;
 project_name?: string;
 transport_cost?: number;
 approver?: User;
}

export interface ApplicationPayload {
	date: string;
	work_option: string;
	start_time: string;
	end_time: string;
	is_special: boolean;
  reason: string;
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