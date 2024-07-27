import { Inject, Injectable } from "@nestjs/common";
import { DB, RefreshTokens, Users } from "db/schema";
import { Kysely, Selectable } from "kysely";

import { DATABASE_TOKEN } from "src/database/constants";

import { CreateRefreshTokenDTO } from "./dtos/create-refresh-token.dto";
import { DeleteRefreshTokenDTO } from "./dtos/delete-refresh-token.dto";

@Injectable()
export class RefreshTokensRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

	async findByUser(userId: RefreshTokens["user_id"]) {
		return this.db
			.selectFrom("refresh_tokens")
			.selectAll()
			.where("user_id", "=", userId)
			.execute();
	}

	async insert(createRefreshTokenDto: CreateRefreshTokenDTO) {
		await this.db
			.insertInto("refresh_tokens")
			.values(createRefreshTokenDto)
			.executeTakeFirst();
	}

	async delete(deleteRefreshTokenDto: DeleteRefreshTokenDTO) {
		const { id, userId } = deleteRefreshTokenDto;

		return this.db
			.deleteFrom("refresh_tokens")
			.where("id", "=", id)
			.where("user_id", "=", userId)
			.executeTakeFirst();
	}

	async deleteExpiredTokens(userId: Selectable<Users>["id"], now: Date) {
		return this.db
			.deleteFrom("refresh_tokens")
			.where("user_id", "=", userId)
			.where("expires_at", "<", now)
			.execute();
	}
}
