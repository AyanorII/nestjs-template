import { DB } from "db/schema";
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<DB>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await sql`ALTER TYPE provider ADD VALUE 'github'`.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await sql`ALTER TYPE provider DROP VALUE 'github'`.execute(db);
}
