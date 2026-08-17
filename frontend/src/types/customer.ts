export interface Customer {
  id: string | number;
  recency: number; // in days
  frequency: number; // total orders
  monetary: number; // total spent
  rfmScore?: string; // e.g. "555" or "432"
  rScore?: number; // 1-5
  fScore?: number; // 1-5
  mScore?: number; // 1-5
  kmeansCluster: number;
  dbscanCluster: number; // -1 for noise
  segmentId: string;
  segmentName: string;
  segmentColor?: string;
  segmentIcon?: string;
  recommendedAction?: string;
  lastPurchaseDate?: string;
  firstPurchaseDate?: string;
  averageOrderValue?: number;
}

export interface CustomerFilters {
  search?: string;
  segmentId?: string;
  kmeansCluster?: number;
  minMonetary?: number;
  maxMonetary?: number;
  minRecency?: number;
  maxRecency?: number;
  minFrequency?: number;
  maxFrequency?: number;
  sortBy?: "recency" | "frequency" | "monetary" | "id";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
