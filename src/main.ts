import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Config } from "config/configuration";

import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const logger = new Logger();

	const port = configService.get<Config["PORT"]>("PORT") || 8000;
	await app.listen(port);
	logger.log(`Server is running on port: ${port}`);
}

bootstrap().catch((error) => {
	console.error(error);
	process.exit(1);
});
