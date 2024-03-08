import * as Joi from "joi";

export interface Config {
	PORT: number;
	NODE_ENV: string;
	CORS_ORIGIN: string;
}

export const configSchema = Joi.object<Config>({
	PORT: Joi.number().default(8000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),
	CORS_ORIGIN: Joi.string().required(),
	// Add your own configuration options here
});
