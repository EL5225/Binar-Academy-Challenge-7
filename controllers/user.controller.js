const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail, getHTML } = require("../utils/nodemailer");
const { JWT_SECRET } = process.env;

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    const existUser = await prisma.user.findUnique({ where: { email } });

    if (existUser) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Email already exists",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Password does not match",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        notifications: {
          create: {
            title: `Halo ${name}!`,
            content: "Selamat datang di aplikasi ini!",
          },
        },
      },
    });

    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Invalid Email or Password",
      });
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (!decryptedPassword) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Invalid Email or Password",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.redirect(`/home?token=${token}`);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Email not found",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    const url = `http://localhost:3000/reset-password?token=${token}`;

    const html = await getHTML("forgot.ejs", {
      name: user.name,
      url,
    });
    sendEmail(email, "Test", html);

    res.status(200).json({
      status: true,
      message: "Email sent",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { new_password, new_confirm_password } = req.body;

    if (new_password !== new_confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "New Password does not match",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    const notifications = await prisma.notifications.create({
      data: {
        title: `Pembaharuan Password`,
        content: "Password Anda telah diperbaharui! Jangan sampai lupa lagi!",
        user_id: user.id,
      },
      select: {
        title: true,
        content: true,
      },
    });

    req.io.emit(`notification_${user.id}`, notifications);

    res.status(200).json({
      status: true,
      message: "Password updated",
    });
  } catch (error) {
    next(error);
  }
};

const deleteAllUser = async (req, res, next) => {
  try {
    await prisma.user.deleteMany();

    res.status(200).json({
      status: true,
      message: "All user deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  deleteAllUser,
};
