export interface ApiResponse<T = any> {
    success?: boolean;
    error?: boolean;
    message?: string;
    data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}