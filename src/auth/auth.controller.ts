import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { CreateUserDTO } from "src/users/dtos/create-user.dto";

import { AuthService } from "./auth.service";
import { Public } from "./decorators/is_public.decorator";
import { LoginEmailPasswordDTO } from "./dtos/login-email-password.dto";
import { JwtGuard } from "./guards/jwt.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	async register(@Body() body: CreateUserDTO) {
		return this.authService.registerWithEmailPassword(body);
	}

	@Post("login")
	async login(@Body() body: LoginEmailPasswordDTO) {
		const { access_token } = await this.authService.loginWithEmailPassword(
			body.email,
			body.password
		);

		return { access_token };
	}

	@Get("protected")
	@UseGuards(JwtGuard)
	@ApiBearerAuth("JWT")
	protected(@Req() request: Request) {
		return request.user;
	}

	@Get("public")
	@Public()
	public() {
		return { message: "This is a public route" };
	}
}
