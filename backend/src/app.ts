import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "./config/passport";
import { config } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { generalRateLimit } from "./middleware/rateLimit.middleware";
import { logger } from "./utils/logger";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.app.frontendUrls,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(passport.initialize());

  app.use(generalRateLimit);

  // request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    next();
  });

  app.use(`/api/${config.apiVersion}`, routes);

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: `Welcome to ${config.app.name} API`,
      version: config.apiVersion,
      documentation: `${config.app.url}/api/${config.apiVersion}/health`,
    });
  });

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};
