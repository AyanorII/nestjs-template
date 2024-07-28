import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Config } from "config/configuration";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import helmet from "helmet";
import * as passport from "passport";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService<Config>);
	const logger = new Logger();

	app.use(cookieParser());
	app.use(helmet());
	app.enableCors({
		origin: configService.get("CORS_ORIGIN"),
		credentials: true,
	});
	app.useGlobalPipes(new ValidationPipe());
	app.setGlobalPrefix("api");
	app.useGlobalFilters(new AllExceptionsFilter());

	app.use(
		session({
			secret: configService.get("SESSION_SECRET") as string,
			saveUninitialized: false,
			resave: false,
			cookie: {
				maxAge: 60000,
			},
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());

	const swaggerConfig = new DocumentBuilder()
		.setTitle("NestJS API")
		.setDescription("NestJS API description")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"JWT"
		)
		.build();
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("docs", app, swaggerDocument);

	const port: number = configService.get("PORT") || 8000;
	await app.listen(port);
	logger.log(`Server is running on port: ${port}`);
}

bootstrap().catch((error) => {
	console.error(error);
	process.exit(1);
});
