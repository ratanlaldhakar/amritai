import { logger } from '@/lib/logger';

interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  action: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  let delay = options.delayMs ?? 500;
  const factor = options.backoffFactor ?? 2;
  const shouldRetry = options.shouldRetry ?? (() => true);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }
      logger.warn(`Execution failed on attempt ${attempt}. Retrying in ${delay}ms...`, {}, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= factor;
    }
  }
  throw new Error('Retry loop exited unexpectedly');
}
