import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Config } from "config/configuration";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "../types/jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(configService: ConfigService<Config>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: configService.get("JWT_SECRET") as string,
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
