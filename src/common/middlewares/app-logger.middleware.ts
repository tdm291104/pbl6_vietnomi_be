import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, baseUrl: url } = request;
    const forwardedFor = request.headers["x-forwarded-for"] as string;
    const clientIp = forwardedFor
      ? forwardedFor.split(",").map((ip: string) => ip.trim())[0]
      : request.ip;
    const userAgent = request.get("user-agent") || "";

    response.on("close", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");

      const queries = Object.entries(request.query);
      const appendUrl = queries.map((query) => query.join("=")).join("&");

      this.logger.log(
        `${method} ${url + (queries.length ? "?" + appendUrl : "")} ${statusCode} ${contentLength} - ${clientIp}`,
      );
    });

    next();
  }
}
