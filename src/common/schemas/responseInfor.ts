interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
interface ResponseInfo {
  code: number;
  message: string;
  data: any;
  pagination?: Pagination;
}
