export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "INACTIVE";

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  name: string;
  qrCode: string;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
  activeMerge?: {
    id: string;
    isActive: boolean;
  } | null;
}

export interface CreateTablePayload {
  name: string;
}

export interface UpdateTablePayload {
  name?: string;
  status?: TableStatus;
}

export interface TableMergeOrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
  };
}

export interface TableMergeOrder {
  id: string;
  table: {
    id: string;
    name: string;
  } | null;
  status: string;
  total: number;
  customerPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: TableMergeOrderItem[];
}

export interface TableMerge {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tables: Array<{
    id: string;
    name: string;
    status: TableStatus;
  }>;
  orders: TableMergeOrder[];
  orderCount: number;
  activeOrderCount: number;
  total: number;
}

export interface MergeTablesPayload {
  tableIds: string[];
}