import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });
  app.enableCors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
