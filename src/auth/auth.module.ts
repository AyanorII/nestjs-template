import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "config/configuration";
import { RefreshTokensModule } from "src/refresh-tokens/refresh-tokens.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionSerializer } from "./serializers/session.serializer";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Config>) => ({
				secret: configService.get("JWT_SECRET"),
				signOptions: {
					expiresIn: configService.get("JWT_EXPIRES_IN"),
				},
				global: true,
			}),
		}),
		UsersModule,
		RefreshTokensModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		RefreshTokenStrategy,
		GoogleStrategy,
		SessionSerializer,
	],
})
export class AuthModule {}
