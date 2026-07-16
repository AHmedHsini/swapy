import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { HttpError } from "../../common/http-error.js";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { toPublicUser } from "../users/users.presenter.js";
import type { LoginInput } from "./auth.schemas.js";

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const signOptions: SignOptions = {
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
    };
    const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, signOptions);

    return {
      accessToken: token,
      tokenType: "Bearer",
      user: toPublicUser(user)
    };
  }
}
