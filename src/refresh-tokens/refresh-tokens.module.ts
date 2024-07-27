import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "src/database/database.module";

import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { RefreshTokensService } from "./refresh-tokens.service";

@Module({
	imports: [DatabaseModule, JwtModule],
	providers: [RefreshTokensService, RefreshTokensRepository],
	exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
