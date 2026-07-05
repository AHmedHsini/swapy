import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      NODE_ENV: "test",
      APP_NAME: "Swapy Campus API",
      HOST: "127.0.0.1",
      DATABASE_URL: "postgresql://swapy:swapy_password@localhost:5432/swapy?schema=public",
      JWT_SECRET: "test-secret-for-swapy-campus",
      JWT_EXPIRES_IN: "1d",
      CORS_ORIGINS: "http://localhost:5173"
    },
    coverage: {
      provider: "v8"
    }
  }
});
