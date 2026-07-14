import { NextResponse } from 'next/server';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class WhatsAppApiError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 502, 'WHATSAPP_API_ERROR', details);
  }
}

export class GeminiApiError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 502, 'GEMINI_API_ERROR', details);
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    logger.warn(`API Warning [${error.code}]: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Generic/Unknown errors
  logger.error('Unhandled API Exception:', {}, error);

  const isProduction = process.env.NODE_ENV === 'production';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isProduction
          ? 'An unexpected error occurred'
          : error instanceof Error
            ? error.message
            : 'Unknown error',
      },
    },
    { status: 500 }
  );
}

type RouteHandler = (request: any, context: any) => Promise<Response> | Response;

export function withErrorHandling(handler: RouteHandler): any {
  return async (request: any, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
