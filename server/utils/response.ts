import { Response } from 'express';

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: any;
}

export function sendSuccess<T extends Record<string, any>>(
  res: Response,
  data: T,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response {
  const errorObj: ApiErrorDetail = {
    code,
    message,
    ...(details ? { details } : {})
  };

  return res.status(statusCode).json({
    success: false,
    error: message, // Backward-compatible string for legacy frontend checks
    code,
    errorDetail: errorObj
  });
}
