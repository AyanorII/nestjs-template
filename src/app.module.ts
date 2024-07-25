import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { Config, configSchema } from "config/configuration";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: configSchema,
		}),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<Config>) => [
				{
					ttl: Number(config.get("THROTTLER_TTL")),
					limit: Number(config.get("THROTTLER_LIMIT")),
				},
			],
		}),
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
