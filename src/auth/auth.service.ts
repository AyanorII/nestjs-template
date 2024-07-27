import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Config } from "config/configuration";
import { Users } from "db/schema";
import { Selectable } from "kysely";
import { RefreshTokensService } from "src/refresh-tokens/refresh-tokens.service";
import { CreateUserDTO } from "src/users/dtos/create-user.dto";
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

	async registerWithEmailPassword(createUserDTO: CreateUserDTO) {
		return await this.usersService.createUser(createUserDTO);
	}

	async loginWithEmailPassword(
		email: Users["email"],
		password: Users["password"]
	) {
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

		if (!foundUser) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isValidPassword = await this.validatePassword(
			password,
			foundUser.passwordSalt,
			foundUser.password
		);

		if (!isValidPassword) {
			throw new UnauthorizedException("Invalid credentials");
		}

		return foundUser;
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
