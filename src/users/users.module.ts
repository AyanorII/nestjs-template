import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";

import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
	imports: [DatabaseModule],
	providers: [UsersRepository, UsersService],
	exports: [UsersRepository, UsersService],
})
export class UsersModule {}
