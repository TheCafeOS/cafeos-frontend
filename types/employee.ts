export type EmployeeRole = "OWNER" | "MANAGER" | "STAFF";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<EmployeeRole, "OWNER">;
}

export interface UpdateEmployeePayload {
  name: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeStatusPayload {
  isActive: boolean;
}