import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";
import { Users } from "db/schema";
import { Insertable } from "kysely";

export class RegisterWithEmailPasswordDTO
	implements Pick<Insertable<Users>, "email" | "password">
{
	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	@IsStrongPassword()
	password: string;
}
