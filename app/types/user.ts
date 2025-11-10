export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
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
  role: Role;
  department: Department;
  transport_routes?: TransportRoute[];
}