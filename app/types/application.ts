import { User } from './user';

export interface ApplicationStatus {
  id: number;
  name: string;
}

export interface Application {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  application_status_id: number;
  approver_comment?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  application_status?: ApplicationStatus;
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