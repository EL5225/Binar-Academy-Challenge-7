const { Router } = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  deleteAllUser,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares");

const userRouter = Router();

// user
userRouter.delete("/users/delete-all", deleteAllUser);

// auth
userRouter.post("/auth/register", register);
userRouter.post("/auth/login", login);
userRouter.post("/auth/forgot-password", forgotPassword);
userRouter.post("/auth/reset-password", authenticate, resetPassword);

module.exports = userRouter;
