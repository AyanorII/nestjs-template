import { Users } from "db/schema";
import { Selectable } from "kysely";

type JwtPayloadTimestamp = {
	iat: number;
	exp: number;
};

export type JwtPayload = {
	sub: Selectable<Users>["id"];
	email: Users["email"];
} & JwtPayloadTimestamp;

export type AccessToken = string;
