import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const activate = (await super.canActivate(context)) as boolean;

		await super.logIn(request);
		return activate;
	}
}
