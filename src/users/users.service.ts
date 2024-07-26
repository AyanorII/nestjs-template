import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { CreateUserDTO } from "./dtos/create-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async createUser(newUser: CreateUserDTO) {
		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(newUser.password, salt);

		return this.usersRepository.insert({
			...newUser,
			password: hash,
			passwordSalt: salt,
		});
	}

	async findOneByEmail(email: string) {
		return this.usersRepository.findOneByEmail(email);
	}

	async findAll() {
		return this.usersRepository.findAll();
	}
}
