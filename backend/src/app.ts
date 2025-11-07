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

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.app.frontendUrls,
      credentials: true,
    }),
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Passport
  app.use(passport.initialize());

  // Rate limiting
  app.use(generalRateLimit);

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    next();
  });

  // API routes
  app.use(`/api/${config.apiVersion}`, routes);

  // Root endpoint
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: `Welcome to ${config.app.name} API`,
      version: config.apiVersion,
      documentation: `${config.app.url}/api/${config.apiVersion}/health`,
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
