import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Config } from "config/configuration";
import { Profile, Strategy } from "passport-google-oauth20";

import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor(
		private readonly authService: AuthService,
		configService: ConfigService<Config>
	) {
		super({
			clientID: configService.get("GOOGLE_CLIENT_ID", { infer: true }),
			clientSecret: configService.get("GOOGLE_CLIENT_SECRET", { infer: true }),
			callbackURL: configService.get("GOOGLE_CALLBACK_URL", { infer: true }),
			scope: ["email", "profile"],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile
	) {
		const user = await this.authService.validateGoogleUser(profile);

		return user || null;
	}
}
