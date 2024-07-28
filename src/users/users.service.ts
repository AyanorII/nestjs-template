import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Users } from "db/schema";
import { Insertable } from "kysely";

import { RegisterWithEmailPasswordDTO } from "./dtos/register-with-email-password.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async createUser(newUser: Insertable<Users>) {
		return this.usersRepository.insert(newUser);
	}

	async createUserWithEmailPassword(newUser: RegisterWithEmailPasswordDTO) {
		const { hash, salt } = await this.generatePasswordHash(newUser.password);

		return this.usersRepository.insert({
			...newUser,
			provider: "local",
			password: hash,
			password_salt: salt,
		});
	}

	async createUserWithGoogle(user: Omit<Insertable<Users>, "provider">) {
		return this.usersRepository.upsert({
			...user,
			provider: "google",
		});
	}

	async findOneByEmail(email: string) {
		return this.usersRepository.findOneByEmail(email);
	}

	async findAll() {
		return this.usersRepository.findAll();
	}

	async upsert(dto: Insertable<Users>) {
		return this.usersRepository.upsert(dto);
	}

	async generatePasswordHash(password: string) {
		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(password, salt);

		return { hash, salt };
	}
}
