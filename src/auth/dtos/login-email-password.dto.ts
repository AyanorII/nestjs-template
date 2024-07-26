import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { Users } from "db/schema";

export class LoginEmailPasswordDTO
	implements Pick<Users, "email" | "password">
{
	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	password: string;
}
