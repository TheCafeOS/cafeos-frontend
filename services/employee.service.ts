import api from "@/services/api";

import type {
  CreateEmployeePayload,
  Employee,
  EmployeeListResponse,
  EmployeeQueryParams,
  UpdateEmployeePayload,
  UpdateEmployeeStatusPayload,
} from "@/types/employee";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getEmployees(
  params: EmployeeQueryParams = {},
): Promise<EmployeeListResponse> {
  const response = await api.get<
    ApiResponse<Employee[]> & {
      pagination: EmployeeListResponse["pagination"];
    }
  >("/api/v1/employees", {
   params: {
  page: params.page ?? 1,
  limit: params.limit ?? 10,
  search: params.search?.trim() || undefined,

  role: params.role || undefined,
  isActive: params.isActive,

  sort: params.sort,
  order: params.order,
},
  });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getEmployee(
  id: string,
): Promise<Employee> {
  const response = await api.get<ApiResponse<Employee>>(
    `/api/v1/employees/${id}`,
  );

  return response.data.data;
}

export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<Employee> {
  const response = await api.post<ApiResponse<Employee>>(
    "/api/v1/employees",
    payload,
  );

  return response.data.data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const response = await api.patch<ApiResponse<Employee>>(
    `/api/v1/employees/${id}`,
    payload,
  );

  return response.data.data;
}

export async function updateEmployeeStatus(
  id: string,
  payload: UpdateEmployeeStatusPayload,
): Promise<Employee> {
  const response = await api.patch<ApiResponse<Employee>>(
    `/api/v1/employees/${id}/status`,
    payload,
  );

  return response.data.data;
}

export async function deleteEmployee(
  id: string,
): Promise<void> {
  await api.delete(`/api/v1/employees/${id}`);
}