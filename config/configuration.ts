import * as Joi from "joi";

export interface Config {
	PORT: number;
	NODE_ENV: string;
	CORS_ORIGIN: string;
	THROTTLER_TTL: number;
	THROTTLER_LIMIT: number;
	DB_HOST: string;
	DB_USER: string;
	DB_PASSWORD: string;
	DB_NAME: string;
	DATABASE_URL: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
}

export const configSchema = Joi.object<Config>({
	PORT: Joi.number().default(8000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),
	CORS_ORIGIN: Joi.string().required(),
	THROTTLER_TTL: Joi.number().default(60_000), // 60 seconds
	THROTTLER_LIMIT: Joi.number().default(60),

	// Database
	DB_HOST: Joi.string().required(),
	DB_USER: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_NAME: Joi.string().required(),
	DATABASE_URL: Joi.string().required(),

	// JWT
	JWT_SECRET: Joi.string().required(),
	JWT_EXPIRES_IN: Joi.string().required(),
	// Add your own configuration options here
});
