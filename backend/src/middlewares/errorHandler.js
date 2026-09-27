// Menangani error parsing JSON bad request & unhandled exceptions
export const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  console.error(`[Error ${statusCode}]:`, err.message || err);

  const isProd = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
  const errorMessage = isProd && statusCode >= 500
    ? 'Terjadi kendala internal pada server.'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Rute tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
};
