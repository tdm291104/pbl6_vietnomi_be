import { registerAs } from "@nestjs/config";
import { DatabaseConfig } from "./database-config.type";
import { IsOptional, IsInt, IsString, IsBoolean } from "class-validator";
import validateConfig from "../../../utils/validate-config";

class EnvironmentVariablesValidator {
  @IsString()
  DATABASE_HOST: string;

  @IsOptional()
  DATABASE_PORT: number;

  @IsOptional()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_USERNAME: string;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED: boolean;
}

export default registerAs<DatabaseConfig>("database", () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const isSslEnabled = process.env.DATABASE_SSL_ENABLED === "true";

  return {
    type: "postgres",
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "10"),
    logging: process.env.NODE_ENV !== "production", // Tắt log ở production
    ssl: isSslEnabled
      ? {
          rejectUnauthorized: false, // Bắt buộc khi deploy trên cloud
        }
      : false,
  };
});
