import type { NextFunction, Request, RequestHandler, Response } from "express";
import { type ZodSchema, ZodError } from "zod";

import { HttpError } from "./http-error.js";

type ValidationTarget = "body" | "params" | "query";

export function validate(schema: ZodSchema, target: ValidationTarget = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(422, "Validation failed", error.flatten()));
        return;
      }
      next(error);
    }
  };
}

