export function errorMiddleware(error, req, res, next) {
  const status = Number(error?.status) || Number(error?.statusCode) || 500;

  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  res.status(status).json({
    error: error?.message || 'Internal server error',
  });
}
