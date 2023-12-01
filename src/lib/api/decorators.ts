import { createFunctionPrecondition } from '@sapphire/decorators';
import { RateLimitManager } from '@sapphire/ratelimits';
import {
  HttpCodes,
  type ApiRequest,
  type ApiResponse,
} from '@sapphire/plugin-api';

export function authenticated() {
  createFunctionPrecondition(
    (request: ApiRequest) => Boolean(request.auth?.token),
    (_request: ApiRequest, response: ApiResponse) =>
      response.error(HttpCodes.Unauthorized),
  );
}

export function rateLimit(
  time: number,
  limit: number = 1,
  auth: boolean = false,
) {
  const manager = new RateLimitManager(time, limit);
  return createFunctionPrecondition(
    (request: ApiRequest, response: ApiResponse) => {
      const id = (
        auth
          ? request.auth!.id
          : request.headers['x-api-key'] || request.socket.remoteAddress
      ) as string;
      const bucket = manager.acquire(id);

      response.setHeader('Date', new Date().toUTCString());
      response.setHeader('X-RateLimit-Limit', time);
      response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
      response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

      if (bucket.limited) {
        response.setHeader('Retry-After', bucket.remainingTime.toString());
        return true;
      }

      try {
        bucket.consume();
      } catch {}

      return false;
    },
  );
}
