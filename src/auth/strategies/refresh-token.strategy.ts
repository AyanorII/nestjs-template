import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Config } from "config/configuration";
import { Users } from "db/schema";
import { Request } from "express";
import { Selectable } from "kysely";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

import { JwtPayload } from "../types/jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	"jwt-refresh"
) {
	constructor(
		private readonly usersService: UsersService,
		configService: ConfigService<Config>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => this.extractJwtFromCookie(req),
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get("REFRESH_TOKEN_SECRET") as string,
		});
	}

	async validate(payload: JwtPayload): Promise<Selectable<Users> | null> {
		const user = await this.usersService.findOneByEmail(payload.email);

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}

	extractJwtFromCookie(req: Request) {
		const token = req.cookies["refresh_token"] as string | undefined;

		if (!token) {
			throw new UnauthorizedException();
		}

		return token;
	}
}
