export interface Page<T> {
  records: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
