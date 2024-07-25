import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";
import { Pool } from "pg";

dotenv.config();

const configService = new ConfigService();

export default defineConfig({
	dialect: "pg", // a `Kysely` dialect instance OR the name of an underlying driver library (e.g. `'pg'`).
	dialectConfig: {
		pool: new Pool({
			host: configService.get<string>("DB_HOST"),
			user: configService.get<string>("DB_USER"),
			password: configService.get<string>("DB_PASSWORD"),
			database: configService.get<string>("DB_NAME"),
		}),
	},
	// dialectConfig, // optional. when `dialect` is the name of an underlying driver library, `dialectConfig` is the options passed to the Kysely dialect that matches that library.
	migrations: {
		// optional.
		// allowJS, // optional. controls whether `.js`, `.cjs` or `.mjs` migrations are allowed. default is `false`.
		getMigrationPrefix: getKnexTimestampPrefix, // optional. a function that returns a migration prefix. affects `migrate make` command. default is `() => ${Date.now()}_`.
		migrationFolder: "./db/migrations", // optional. name of migrations folder. default is `'migrations'`.
		// migrator, // optional. a `Kysely` migrator instance. default is `Kysely`'s `Migrator`.
		// provider, // optional. a `Kysely` migration provider instance. default is `kysely-ctl`'s `TSFileMigrationProvider`.
	},
	// plugins, // optional. `Kysely` plugins list. default is `[]`.
	// seeds: { // optional.
	//   allowJS, // optional. controls whether `.js`, `.cjs` or `.mjs` seeds are allowed. default is `false`.
	//   getSeedPrefix, // optional. a function that returns a seed prefix. affects `seed make` command. default is `() => ${Date.now()}_`.
	//   provider, // optional. a seed provider instance. default is `kysely-ctl`'s `FileSeedProvider`.
	//   seeder, // optional. a seeder instance. default is `kysely-ctl`'s `Seeder`.
	//   seedFolder, // optional. name of seeds folder. default is `'seeds'`.
	// }
});
