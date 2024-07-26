import { Inject, Injectable } from "@nestjs/common";
import { DB, Users } from "db/schema";
import { Insertable, Kysely } from "kysely";

import { DATABASE_TOKEN } from "src/database/constants";

@Injectable()
export class UsersRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

	async findOneByEmail(email: Users["email"]) {
		return this.db
			.selectFrom("users")
			.selectAll()
			.where("email", "=", email)
			.executeTakeFirst();
	}

	async findAll() {
		return this.db.selectFrom("users").selectAll().execute();
	}

	async insert(newUser: Insertable<Users>) {
		return this.db
			.insertInto("users")
			.values(newUser)
			.returningAll()
			.executeTakeFirstOrThrow();
	}
}
