import * as Joi from "joi";

export interface Config {
	PORT: number;
	NODE_ENV: string;
}

export const configSchema = Joi.object<Config>({
	PORT: Joi.number().default(8000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),
	// Add your own configuration options here
});
