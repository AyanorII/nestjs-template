import { IsString } from "class-validator";
import { RefreshTokens, Users } from "db/schema";
import { Selectable } from "kysely";

export class DeleteRefreshTokenDTO {
	@IsString()
	id: Selectable<RefreshTokens>["id"];

	@IsString()
	userId: Selectable<Users>["id"];
}
