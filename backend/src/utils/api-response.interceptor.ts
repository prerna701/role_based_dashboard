import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './types/api-response.type';

type ResponseWithData = {
  data: unknown;
  meta?: unknown;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  [key: string]: unknown;
};

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((payload: unknown) => {
        const isResponseWithData =
          payload !== null &&
          typeof payload === 'object' &&
          !Array.isArray(payload) &&
          'data' in payload;

        const isStandardResponse =
          isResponseWithData &&
          'success' in payload &&
          'message' in payload &&
          typeof payload.message === 'string';

        if (isStandardResponse) {
          return payload as ApiResponse<unknown>;
        }

        const responseBody = isResponseWithData
          ? (payload as ResponseWithData)
          : { data: payload };

        return {
          success: true,
          message: 'Request successful',
          data: responseBody.data,
          ...(responseBody.meta === undefined
            ? {}
            : { meta: responseBody.meta }),
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
        };
      }),
    );
  }
}
