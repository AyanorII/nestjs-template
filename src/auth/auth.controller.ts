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
import { RegisterWithEmailPasswordDTO } from "src/users/dtos/register-with-email-password.dto";

import { AuthService } from "./auth.service";
import { Public } from "./decorators/is_public.decorator";
import { LoginEmailPasswordDTO } from "./dtos/login-email-password.dto";
import { GithubAuthGuard } from "./guards/github.guard";
import { GoogleAuthGuard } from "./guards/google.guard";
import { JwtGuard } from "./guards/jwt.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("register")
	async register(
		@Body() body: RegisterWithEmailPasswordDTO,
		@Res() res: Response
	) {
		const { accessToken, refreshToken, expiresIn } =
			await this.authService.registerWithEmailPassword(body);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiresIn - Date.now(),
		});

		return res.json({
			access_token: accessToken,
		});
	}

	@Public()
	@Post("login")
	async login(@Body() body: LoginEmailPasswordDTO, @Res() res: Response) {
		const { accessToken, refreshToken, expiresIn } =
			await this.authService.loginWithEmailPassword(body);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiresIn - Date.now(),
		});

		return res.json({
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

		res.cookie("refresh_token", newRefreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiresIn - Date.now(),
		});

		return res.json({
			access_token: accessToken,
		});
	}

	@UseGuards(RefreshTokenGuard)
	@Post("logout")
	async logout(@Req() req: Request, @Res() res: Response) {
		const refreshToken = req.cookies.refresh_token as string;
		const user = req.user as Selectable<Users>;

		await this.authService.logout(user.id, refreshToken);

		res.clearCookie("refresh_token");

		return res.json({
			message: "Successfully logged out",
		});
	}

	@UseGuards(GoogleAuthGuard)
	@Get("google")
	async googleLogin() {}

	@UseGuards(GoogleAuthGuard)
	@Get("google/callback")
	async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
		const user = req.user as Selectable<Users>;

		const {
			accessToken,
			refreshToken,
			refreshTokenExpiresIn: expiresIn,
		} = await this.authService.generateTokens(user);

		res.status(200).cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiresIn - Date.now(),
		});

		return res.json({
			access_token: accessToken,
		});
	}

	@UseGuards(GithubAuthGuard)
	@Get("github")
	async githubLogin() {}

	@UseGuards(GithubAuthGuard)
	@Get("github/callback")
	async githubCallback(@Req() req: Request, @Res() res: Response) {
		const user = req.user as Selectable<Users>;

		const {
			accessToken,
			refreshToken,
			refreshTokenExpiresIn: expiresIn,
		} = await this.authService.generateTokens(user);

		res.status(200).cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiresIn - Date.now(),
		});

		return res.json({
			access_token: accessToken,
		});
	}

	@UseGuards(JwtGuard)
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
