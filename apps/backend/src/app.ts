import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { HttpError } from "./common/http-error.js";
import { routes } from "./routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/", (_req, res) => {
    res.json({
      status: "ok",
      service: env.appName,
      apiBasePath: "/api",
      healthCheck: "/api/health"
    });
  });

  app.use("/api", routes);

  app.use((_req, _res, next) => {
    next(new HttpError(404, "Route not found"));
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
          details: error.details
        }
      });
    }

    console.error(error);
    return res.status(500).json({
      error: {
        message: "Internal server error"
      }
    });
  });

  return app;
}

