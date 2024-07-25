import type { ColumnType } from "kysely";

export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;

export type Provider = "google" | "local";

export interface Users {
	email: string;
	first_name: string | null;
	id: Generated<string>;
	last_name: string | null;
	password: string;
	passwordSalt: string;
	photo_url: string | null;
	provider: Provider;
}

export interface DB {
	users: Users;
}
