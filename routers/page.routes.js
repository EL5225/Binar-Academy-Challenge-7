const { Router } = require("express");
const { authenticate } = require("../middlewares");

const pageRouter = Router();

pageRouter.get("/", (req, res) => {
  res.render("register");
});

pageRouter.get("/login", (req, res) => {
  res.render("login");
});

pageRouter.get("/home", authenticate, (req, res) => {
  res.render("home", { user: req.user });
});

pageRouter.get("/reset-password", authenticate, (req, res) => {
  res.render("reset-password", { token: req.query.token });
});

pageRouter.get("/update-password", (req, res) => {
  res.render("update-password");
});

module.exports = pageRouter;
