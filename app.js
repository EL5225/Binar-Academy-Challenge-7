require("dotenv").config();

const express = require("express");
const Sentry = require("@sentry/node");
const {
  notFoundHandler,
  internalServerErrorHandler,
} = require("./middlewares");
const pageRouter = require("./routers/page.routes");
const userRouter = require("./routers/user.routes");
const { PORT, SENTRY_DSN } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

app.use(Sentry.Handlers.tracingHandler());

const server = require("http").createServer(app);
const io = require("./socket")(server);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/", pageRouter);
app.use("/api", userRouter);

app.use(Sentry.Handlers.errorHandler());
app.use(notFoundHandler);
app.use(internalServerErrorHandler);

server.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
