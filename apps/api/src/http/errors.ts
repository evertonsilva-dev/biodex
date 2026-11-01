import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    data: null,
    error: { status: 404, name: 'NotFoundError', message: 'Not found.' },
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const isHttpError = error instanceof HttpError;
  const status = isHttpError ? error.status : 500;

  if (status >= 500) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`API request failed: ${message}`);
  }

  response.status(status).json({
    data: null,
    error: {
      status,
      name: status === 500 ? 'InternalServerError' : 'ApplicationError',
      message: status === 500
        ? 'An unexpected error occurred.'
        : error instanceof Error ? error.message : String(error),
    },
  });
};
