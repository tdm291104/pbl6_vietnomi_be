import { registerAs } from "@nestjs/config";
import { DatabaseConfig } from "./database-config.type";
import {
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
} from "class-validator";
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

  return {
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME || "test",
    username: process.env.DATABASE_USERNAME,
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
    sslEnabled: process.env.DATABASE_SSL_ENABLED === "true",
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === "false",
    ca: process.env.DATABASE_CA,
    key: process.env.DATABASE_KEY,
    cert: process.env.DATABASE_CERT,
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || "10"),
    logging: true,
  };
});
