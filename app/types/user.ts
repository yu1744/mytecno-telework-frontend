export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  department_id: number;
}

export interface TransportRoute {
  id: number;
  departure_station: string;
  via_station: string;
  arrival_station: string;
  transport_type: string;
  fare: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  hired_date?: string;
  employee_number: string;
  role_id: number;
  department_id: number;
  group_id?: number;
  position?: string;
  manager_id?: number;
  is_caregiver?: boolean;
  has_child_under_elementary?: boolean;
  address?: string;
  phone_number?: string;
  microsoft_account_id?: string;
  role: Role;
  department: Department;
  group?: Group;
  transport_routes?: TransportRoute[];
}