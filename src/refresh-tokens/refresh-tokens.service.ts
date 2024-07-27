import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Config } from "config/configuration";
import { randomUUID } from "crypto";
import { RefreshTokens, Users } from "db/schema";
import { Selectable } from "kysely";
import { JwtPayload } from "src/auth/types/jwt";

import { DeleteRefreshTokenDTO } from "./dtos/delete-refresh-token.dto";
import { RefreshTokensRepository } from "./refresh-tokens.repository";

@Injectable()
export class RefreshTokensService {
	constructor(
		private readonly refreshTokensRepository: RefreshTokensRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Config>
	) {}

	async createToken(user: Selectable<Users>) {
		const tokenId = this.generateTokenId();

		const token = await this.jwtService.signAsync(
			{ email: user.email, sub: user.id },
			{
				secret: this.configService.get("REFRESH_TOKEN_SECRET"),
				expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRES_IN"),
				jwtid: tokenId,
			}
		);

		const salt = await bcrypt.genSalt();
		const hashedToken = await bcrypt.hash(token, salt);

		const decryptedToken = await this.jwtService.verifyAsync<JwtPayload>(
			token,
			{ secret: this.configService.get("REFRESH_TOKEN_SECRET") }
		);

		const expiresIn = decryptedToken.exp * 1000;
		const expires_at = new Date(expiresIn).toISOString();
		const issued_at = new Date(decryptedToken.iat * 1000).toISOString();

		await this.refreshTokensRepository.insert({
			id: tokenId,
			token: hashedToken,
			user_id: user.id,
			expires_at,
			issued_at,
		});

		return { refreshToken: token, expiresIn };
	}

	async validateRefreshToken(token: string, record: Selectable<RefreshTokens>) {
		const isValid = await bcrypt.compare(token, record.token);
		return isValid;
	}

	async deleteToken(deleteRefreshTokenDto: DeleteRefreshTokenDTO) {
		return this.refreshTokensRepository.delete(deleteRefreshTokenDto);
	}

	async deleteExpiredTokens(userId: Selectable<Users>["id"]) {
		const now = new Date();

		return this.refreshTokensRepository.deleteExpiredTokens(userId, now);
	}

	generateTokenId() {
		return randomUUID();
	}
}
