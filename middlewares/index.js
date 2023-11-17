const jwt = require("jsonwebtoken");
const prisma = require("../libs/prisma");
const { JWT_SECRET } = process.env;

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Not Found",
  });
  next();
};

const internalServerErrorHandler = (err, req, res, next) => {
  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
    error: err.message,
  });
};

const authenticate = async (req, res, next) => {
  const authorization = req.query.token;

  if (!authorization) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized",
      error: "Token not found",
    });
  }

  jwt.verify(authorization, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
        error: err.message,
      });
    }

    req.user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        notifications: true,
      },
    });
    next();
  });
};

module.exports = {
  notFoundHandler,
  internalServerErrorHandler,
  authenticate,
};
