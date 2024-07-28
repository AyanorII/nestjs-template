import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Config } from "config/configuration";
import { Users } from "db/schema";
import { Insertable, Selectable } from "kysely";
import { type Profile as GithubProfile } from "passport-github2";
import { type Profile as GoogleProfile } from "passport-google-oauth20";
import { RefreshTokensService } from "src/refresh-tokens/refresh-tokens.service";
import { RegisterWithEmailPasswordDTO } from "src/users/dtos/register-with-email-password.dto";
import { UsersService } from "src/users/users.service";

import { LoginEmailPasswordDTO } from "./dtos/login-email-password.dto";
import { RefreshTokenPayload } from "./types/jwt";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Config>,
		private readonly refreshTokenService: RefreshTokensService
	) {}

	async registerWithEmailPassword(
		registerWithEmailPasswordDTO: RegisterWithEmailPasswordDTO
	) {
		const user = await this.usersService.createUserWithEmailPassword(
			registerWithEmailPasswordDTO
		);

		const { accessToken, refreshToken, refreshTokenExpiresIn } =
			await this.generateTokens(user);

		return { accessToken, refreshToken, expiresIn: refreshTokenExpiresIn };
	}

	async loginWithEmailPassword(
		loginWithEmailPasswordDTO: LoginEmailPasswordDTO
	) {
		const { email, password } = loginWithEmailPasswordDTO;
		const user = await this.validateUser({ email, password });

		const { accessToken, refreshToken, refreshTokenExpiresIn } =
			await this.generateTokens(user);

		return { accessToken, refreshToken, expiresIn: refreshTokenExpiresIn };
	}

	async logout(userId: Selectable<Users>["id"], refreshToken: string) {
		const decoded: RefreshTokenPayload = this.jwtService.decode(refreshToken);

		await this.refreshTokenService.deleteToken({ id: decoded.jti, userId });
		await this.refreshTokenService.deleteExpiredTokens(userId);
	}

	async validateUser(loginEmailPasswordDTO: LoginEmailPasswordDTO) {
		const { email, password } = loginEmailPasswordDTO;

		const foundUser = await this.usersService.findOneByEmail(email);

		if (
			!foundUser ||
			!foundUser.password ||
			!foundUser.password_salt ||
			foundUser.provider !== "local"
		) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isValidPassword = await this.validatePassword(
			password,
			foundUser.password_salt,
			foundUser.password
		);

		if (!isValidPassword) {
			throw new UnauthorizedException("Invalid credentials");
		}

		return foundUser;
	}

	async validateGoogleUser(profile: GoogleProfile) {
		const { emails, name, photos } = profile;

		if (!emails?.length) {
			throw new BadRequestException("Email not provided by Google");
		}

		const googleUser: Insertable<Users> = {
			email: emails[0].value,
			first_name: name?.givenName,
			last_name: name?.familyName,
			photo_url: photos?.[0]?.value,
			provider: "google",
		};

		const user = await this.usersService.upsert(googleUser);
		return user;
	}

	async validateGithubUser(profile: GithubProfile) {
		const { emails, displayName, photos } = profile;

		if (!emails?.length) {
			throw new BadRequestException("Email not provided by Github");
		}

		const githubUser: Insertable<Users> = {
			email: emails[0].value,
			first_name: displayName,
			photo_url: photos?.[0]?.value,
			provider: "github",
		};

		const user = await this.usersService.upsert(githubUser);
		return user;
	}

	async validatePassword(password: string, salt: string, hash: string) {
		const hashedPassword = await bcrypt.hash(password, salt);

		return hashedPassword === hash;
	}

	async signPayload(
		user: Pick<Selectable<Users>, "id" | "email">,
		options?: JwtSignOptions
	) {
		return this.jwtService.signAsync(
			{
				sub: user.id,
				email: user.email,
			},
			options
		);
	}

	async generateAccessToken(user: Selectable<Users>) {
		const accessToken = await this.signPayload(user, {
			secret: this.configService.get("JWT_SECRET"),
			expiresIn: this.configService.get("JWT_EXPIRES_IN"),
		});

		return accessToken;
	}

	async generateTokens(user: Selectable<Users>) {
		const [accessToken, { refreshToken, expiresIn }] = await Promise.all([
			this.generateAccessToken(user),
			this.refreshTokenService.createToken(user),
		]);

		return {
			accessToken,
			refreshToken,
			refreshTokenExpiresIn: expiresIn,
		};
	}

	async refreshToken(user: Selectable<Users>, token: string) {
		const decoded: RefreshTokenPayload = this.jwtService.decode(token);

		await this.refreshTokenService.deleteToken({
			id: decoded.jti,
			userId: user.id,
		});

		const { refreshToken, expiresIn } =
			await this.refreshTokenService.createToken(user);
		const accessToken = await this.generateAccessToken(user);

		return {
			accessToken,
			refreshToken,
			refreshTokenExpiresIn: expiresIn,
		};
	}
}
