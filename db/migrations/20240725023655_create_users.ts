import { DB } from "db/schema";
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<DB>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema
		.createType("provider")
		.asEnum(["local", "google", "github", "facebook"])
		.execute();

	await db.schema
		.createTable("users")
		.addColumn("id", "uuid", (col) =>
			col
				.primaryKey()
				.defaultTo(sql`gen_random_uuid()`)
				.notNull()
		)
		.addColumn("email", "varchar", (col) => col.notNull().unique())
		.addColumn("password", "varchar", (col) => col.notNull())
		.addColumn("passwordSalt", "varchar", (col) => col.notNull())
		.addColumn("first_name", "varchar")
		.addColumn("last_name", "varchar")
		.addColumn("photo_url", "text")
		.addColumn("provider", sql`provider`, (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
	await db.schema.dropTable("users").execute();
	await db.schema.dropType("provider").execute();
}
