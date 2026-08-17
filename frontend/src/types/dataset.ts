export type DatasetStatus =
  | "uploaded"
  | "validating"
  | "ready"
  | "processing"
  | "completed"
  | "failed";

export interface ColumnMapping {
  customerId: string;
  transactionId?: string;
  transactionDate: string;
  quantity?: string;
  unitPrice?: string;
  monetaryValue?: string;
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  excludedRows: number;
  missingCustomerIds: number;
  missingCustomerIdsPct: number;
  cancelledTransactions: number;
  invalidQuantities: number;
  invalidPrices: number;
  duplicateRecords: number;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export interface ValidationCheck {
  id: string;
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  detail?: string;
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  fileSize?: number;
  status: DatasetStatus;
  rowCount: number;
  validRowCount?: number;
  customerCount?: number;
  createdAt: string;
  updatedAt: string;
  lastAnalysisDate?: string;
  analysisCount: number;
  columnMapping?: ColumnMapping;
  qualityReport?: DataQualityReport;
  checks?: ValidationCheck[];
}
