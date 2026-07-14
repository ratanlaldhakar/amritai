import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '@/lib/error';

/**
 * Standard API success response builder
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Helper to safely validate request body using a Zod schema
 */
export async function validateRequestBody<T>(request: Request, schema: z.Schema<T>): Promise<T> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new ValidationError(
        'Invalid request body parameters',
        result.error.flatten().fieldErrors
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Malformed JSON or missing request body');
  }
}
