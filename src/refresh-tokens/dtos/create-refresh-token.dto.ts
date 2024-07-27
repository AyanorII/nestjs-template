import {
	IsDate,
	IsDateString,
	IsHash,
	IsOptional,
	IsUUID,
} from "class-validator";
import { RefreshTokens } from "db/schema";
import { Insertable } from "kysely";

export class CreateRefreshTokenDTO implements Insertable<RefreshTokens> {
	@IsUUID()
	@IsOptional()
	id?: string;

	@IsUUID()
	user_id: string;

	@IsHash("sha256")
	token: string;

	@IsDate()
	@IsDateString()
	expires_at: string | Date;

	@IsDate()
	@IsDateString()
	issued_at: string | Date;
}
