import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from './types/api-response.type';

type ExceptionPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ExceptionPayload)
        : undefined;

    const body: ApiErrorResponse = {
      success: false,
      message: this.getMessage(exceptionResponse, statusCode),
      data: null,
      error: {
        code: this.getErrorCode(payload, statusCode),
        ...(payload ? { details: payload } : {}),
      },
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }

  private getMessage(exceptionResponse: unknown, statusCode: number): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message: unknown }).message;

      if (Array.isArray(message)) {
        return 'Validation failed';
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return statusCode >= 500 ? 'Internal server error' : 'Request failed';
  }

  private getErrorCode(
    payload: ExceptionPayload | undefined,
    statusCode: number,
  ): string {
    return payload?.error ?? HttpStatus[statusCode] ?? 'Error';
  }
}
