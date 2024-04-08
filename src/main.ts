import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Config } from "config/configuration";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const logger = new Logger();

	app.use(helmet());
	app.use(cookieParser());
	app.enableCors({
		origin: configService.get<Config["CORS_ORIGIN"]>("CORS_ORIGIN", {
			infer: true,
		}),
	});
	app.useGlobalPipes(new ValidationPipe());

	const swaggerConfig = new DocumentBuilder()
		.setTitle("NestJS API")
		.setDescription("NestJS API description")
		.build();
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("docs", app, swaggerDocument);

	const port = configService.get<Config["PORT"]>("PORT") || 8000;
	await app.listen(port);
	logger.log(`Server is running on port: ${port}`);
}

bootstrap().catch((error) => {
	console.error(error);
	process.exit(1);
});
