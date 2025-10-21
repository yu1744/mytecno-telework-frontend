export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  hired_date?: string;
  role_id: number;
  department_id: number;
  role?: Role;
  department?: Department;
}