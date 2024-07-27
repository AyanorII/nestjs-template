import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Users } from "db/schema";
import { Request, Response } from "express";
import { Selectable } from "kysely";
import { CreateUserDTO } from "src/users/dtos/create-user.dto";

import { AuthService } from "./auth.service";
import { Public } from "./decorators/is_public.decorator";
import { LoginEmailPasswordDTO } from "./dtos/login-email-password.dto";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("register")
	async register(@Body() body: CreateUserDTO) {
		return this.authService.registerWithEmailPassword(body);
	}

	@Public()
	@Post("login")
	async login(@Body() body: LoginEmailPasswordDTO, @Res() res: Response) {
		const { accessToken, refreshToken, expiresIn } =
			await this.authService.loginWithEmailPassword(body.email, body.password);

		res
			.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: expiresIn - Date.now(),
			})
			.send({
				access_token: accessToken,
			});
	}

	@UseGuards(RefreshTokenGuard)
	@Post("refresh-token")
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		const refreshToken = req.cookies.refresh_token as string;
		const user = req.user as Selectable<Users>;

		const {
			accessToken,
			refreshToken: newRefreshToken,
			refreshTokenExpiresIn: expiresIn,
		} = await this.authService.refreshToken(user, refreshToken);

		res
			.cookie("refresh_token", newRefreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: expiresIn - Date.now(),
			})
			.send({
				access_token: accessToken,
			});
	}

	@UseGuards(RefreshTokenGuard)
	@Post("logout")
	async logout(@Req() req: Request, @Res() res: Response) {
		const refreshToken = req.cookies.refresh_token as string;
		const user = req.user as Selectable<Users>;

		await this.authService.logout(user.id, refreshToken);

		res.clearCookie("refresh_token").send({
			message: "Successfully logged out",
		});
	}

	@Get("protected")
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
