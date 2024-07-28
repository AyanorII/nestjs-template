import { DB } from "db/schema";
import type { Kysely } from "kysely";

export async function up(db: Kysely<DB>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
		.alterTable("users")
		.alterColumn("password", (col) => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable("users")
		.alterColumn("password_salt", (col) => col.dropNotNull())
		.execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
		.alterTable("users")
		.alterColumn("password", (col) => col.setNotNull())
		.execute();

	await db.schema
		.alterTable("users")
		.alterColumn("password_salt", (col) => col.setNotNull())
		.execute();
}
