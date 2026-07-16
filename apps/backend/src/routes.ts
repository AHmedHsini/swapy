import { Router } from "express";

import { authRouter } from "./modules/auth/auth.router.js";
import { healthRouter } from "./modules/health/health.router.js";
import { marketplaceRouter } from "./modules/marketplace/marketplace.router.js";
import { repairRouter } from "./modules/repair/repair.router.js";
import { sustainabilityRouter } from "./modules/sustainability/sustainability.router.js";
import { usersRouter } from "./modules/users/users.router.js";

export const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/users", usersRouter);
routes.use("/marketplace", marketplaceRouter);
routes.use("/repair", repairRouter);
routes.use("/sustainability", sustainabilityRouter);

