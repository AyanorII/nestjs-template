import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { Users } from "db/schema";
import { Selectable } from "kysely";
import { UsersService } from "src/users/users.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly usersService: UsersService) {
		super();
	}

	serializeUser(
		user: Selectable<Users>,
		done: (err: Error | null, payload: Selectable<Users> | null) => void
	) {
		done(null, user);
	}

	async deserializeUser(
		payload: Selectable<Users>,
		done: (err: Error | null, payload: Selectable<Users> | null) => void
	) {
		const user = await this.usersService.findOneByEmail(payload.email);

		return user ? done(null, user) : done(null, null);
	}
}
