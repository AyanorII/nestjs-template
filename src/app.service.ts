import clerkClient, { User } from "@clerk/clerk-sdk-node";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getHello(): string {
		return "Hello World!";
	}

	getUsers(): Promise<User[]> {
		return clerkClient.users.getUserList();
	}
}
