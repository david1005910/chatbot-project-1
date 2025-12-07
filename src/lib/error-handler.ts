/**
 * API Error Handler utility
 * Based on TRD section 9.2
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public details?: unknown) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, `${resource}을(를) 찾을 수 없습니다.`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = '인증이 필요합니다.') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends APIError {
  constructor() {
    super(429, '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalAPIError extends APIError {
  constructor(service: string, originalError?: unknown) {
    super(502, `${service} 서비스 연결에 실패했습니다.`, 'EXTERNAL_API_ERROR');
    this.name = 'ExternalAPIError';
    if (originalError) {
      logger.error(`External API Error (${service})`, originalError);
    }
  }
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export function handleAPIError(error: unknown, endpoint?: string): NextResponse<ErrorResponse> {
  // Log the error
  if (endpoint) {
    logger.apiError(endpoint, error);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        code: 'VALIDATION_ERROR',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    const response: ErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError && error.details) {
      response.details = error.details;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle standard errors
  if (error instanceof Error) {
    logger.error('Unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development'
          ? error.message
          : '서버 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  logger.error('Unknown error type', error);
  return NextResponse.json(
    {
      success: false,
      error: '알 수 없는 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  endpoint: string
): Promise<NextResponse<T> | NextResponse<ErrorResponse>> {
  return handler()
    .then((result) => NextResponse.json(result as T))
    .catch((error) => handleAPIError(error, endpoint));
}
