import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { Config, configSchema } from "config/configuration";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { RefreshTokensModule } from "./refresh-tokens/refresh-tokens.module";
import { UsersModule } from "./users/users.module";

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
		PassportModule.register({
			session: true,
		}),
		DatabaseModule,
		AuthModule,
		UsersModule,
		RefreshTokensModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<Config>) => ({
				secret: config.get("JWT_SECRET"),
				signOptions: {
					expiresIn: config.get("JWT_EXPIRES_IN"),
				},
				global: true,
			}),
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		// {
		// 	provide: APP_GUARD,
		// 	useClass: JwtGuard,
		// },
	],
})
export class AppModule {}
