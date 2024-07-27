import { DB } from "db/schema";
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<DB>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
		.createTable("refresh_tokens")
		.addColumn("id", "uuid", (col) =>
			col
				.primaryKey()
				.defaultTo(sql`gen_random_uuid()`)
				.notNull()
		)
		.addColumn("user_id", "uuid", (col) =>
			col.references("users.id").onDelete("cascade").notNull()
		)
		.addColumn("token", "text", (col) => col.unique().notNull())
		.addColumn("expires_at", "timestamp", (col) => col.notNull())
		.addColumn("issued_at", "timestamp", (col) => col.notNull())
		.execute();

	await db.schema
		.createIndex("refresh_token_user_id_index")
		.on("refresh_tokens")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("refresh_token_token_index")
		.on("refresh_tokens")
		.column("token")
		.execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema.dropTable("refresh_tokens").ifExists().execute();
	await db.schema.dropIndex("refresh_token_user_id_index").ifExists().execute();
	await db.schema.dropIndex("refresh_token_token_index").ifExists().execute();
}
