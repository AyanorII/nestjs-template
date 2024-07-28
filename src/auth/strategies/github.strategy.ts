import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Config } from "config/configuration";
import { Profile, Strategy } from "passport-github2";

import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
	constructor(
		private readonly authService: AuthService,
		configService: ConfigService<Config>
	) {
		super({
			clientID: configService.get("GITHUB_CLIENT_ID", { infer: true }),
			clientSecret: configService.get("GITHUB_CLIENT_SECRET", { infer: true }),
			callbackURL: configService.get("GITHUB_CALLBACK_URL", { infer: true }),
			scope: ["user:email"],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile
	) {
		const user = await this.authService.validateGithubUser(profile);
		return user;
	}
}
