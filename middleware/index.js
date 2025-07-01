const notFoundHandler = (req, res) => {
  return res.status(404).json({ message: "Resource not found" });
};

const errorHandler = (err, req, res, next) => {
  return res.status(500).json({
    message: err.message,
  });
};

module.exports = { notFoundHandler, errorHandler };
