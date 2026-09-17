export type ApiResponse<T, M = unknown> = {
  success: true;
  message: string;
  data: T;
  meta?: M;
  statusCode: number;
  timestamp: string;
  path: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: null;
  error: {
    code: string;
    details?: unknown;
  };
  statusCode: number;
  timestamp: string;
  path: string;
};
