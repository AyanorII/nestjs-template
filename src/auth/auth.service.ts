import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Config } from "config/configuration";
import { Users } from "db/schema";
import { CreateUserDTO } from "src/users/dtos/create-user.dto";
import { UsersService } from "src/users/users.service";

import { LoginEmailPasswordDTO } from "./dtos/login-email-password.dto";
import { AccessToken } from "./types/jwt";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Config>
	) {}

	async registerWithEmailPassword(createUserDTO: CreateUserDTO) {
		return await this.usersService.createUser(createUserDTO);
	}

	async loginWithEmailPassword(
		email: Users["email"],
		password: Users["password"]
	) {
		const user = await this.validateUser({ email, password });

		const payload = { sub: user.id, email: user.email };
		const accessToken: AccessToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.configService.get("JWT_EXPIRES_IN"),
			secret: this.configService.get("JWT_SECRET"),
		});

		return { access_token: accessToken };
	}

	// async validateUser(user: CreateUserDTO) {
	// 	const foundUser = await this.usersService.findOneByEmail(user.email);
	// 	if (foundUser) return foundUser;

	// 	return this.usersService.createUser(user);
	// }
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

	async findAllUsers() {
		return await this.usersService.findAll();
	}

	async validatePassword(password: string, salt: string, hash: string) {
		const hashedPassword = await bcrypt.hash(password, salt);

		return hashedPassword === hash;
	}
}
