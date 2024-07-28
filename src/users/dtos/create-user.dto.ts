import { ApiProperty } from "@nestjs/swagger";
import {
	IsEmail,
	IsOptional,
	IsString,
	IsStrongPassword,
	ValidateIf,
} from "class-validator";
import { Provider, Users } from "db/schema";
import { Insertable } from "kysely";

export class CreateUserDTO implements Omit<Insertable<Users>, "password_salt"> {
	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	@IsStrongPassword()
	@ValidateIf((o) => (o as CreateUserDTO).provider === "local")
	password: string;

	@ApiProperty()
	@IsString()
	provider: Provider;

	@ApiProperty()
	@IsString({})
	@IsOptional()
	first_name?: string | null | undefined;

	@ApiProperty()
	@IsString()
	@IsOptional()
	last_name?: string | null | undefined;

	@ApiProperty()
	@IsString()
	@IsOptional()
	photo_url?: string | null | undefined;
}
