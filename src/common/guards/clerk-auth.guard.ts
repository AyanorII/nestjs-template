import clerkClient from "@clerk/clerk-sdk-node";
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
	private readonly logger = new Logger();

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = request.cookies.__session as string | undefined;

		if (!token) return false;

		try {
			const jwt = await clerkClient.verifyToken(token);
			const user = await clerkClient.users.getUser(jwt.sub);

			return !user.banned;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
	}
}
