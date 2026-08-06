import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      const contentLength = res.getHeader("content-length");
      const size = contentLength ? `${contentLength}b` : "-";

      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms ${size}`,
      );
    });

    next();
  }
}
