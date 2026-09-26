// Menangani error parsing JSON bad request & unhandled exceptions
export const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload. Periksa kembali struktur data JSON yang dikirimkan.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  console.error(`[Error ${statusCode}]:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
};
