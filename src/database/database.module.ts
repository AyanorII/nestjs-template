import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

@Module({
	imports: [ConfigModule.forRoot()],
	providers: [
		{
			provide: "Kysely",
			useFactory: (configService: ConfigService) => {
				return new Kysely({
					dialect: new PostgresDialect({
						pool: new Pool({
							host: configService.get<string>("DB_HOST"),
							user: configService.get<string>("DB_USER"),
							password: configService.get<string>("DB_PASSWORD"),
							database: configService.get<string>("DB_NAME"),
						}),
					}),
				});
			},
			inject: [ConfigService],
		},
	],
	exports: ["Kysely"],
})
export class DatabaseModule {}
