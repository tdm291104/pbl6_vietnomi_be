import { registerAs } from "@nestjs/config";
import { AppConfig } from "./app-config.type";
import validateConfig from "../../utils/validate-config";
import { IsEnum, IsOptional, IsString } from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;
}

export default registerAs<AppConfig>("app", () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    name: process.env.APP_NAME || "app",
    workingDirectory: process.env.PWD || process.cwd(),
    apiPrefix: process.env.API_PREFIX || "api",
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || "en",
    headerLanguage: process.env.APP_HEADER_LANGUAGE || "x-custom-lang",
  };
});
