export type Category = {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoryListResponse {
  data: Category[];
  pagination: Pagination;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  sort?: "name" | "createdAt";
  order?: "asc" | "desc";
}