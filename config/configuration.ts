import * as Joi from "joi";

export interface Config {
	PORT: number;
	NODE_ENV: string;
	CORS_ORIGIN: string;
	THROTTLER_TTL: number;
	THROTTLER_LIMIT: number;
}

export const configSchema = Joi.object<Config>({
	PORT: Joi.number().default(8000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),
	CORS_ORIGIN: Joi.string().required(),
	THROTTLER_TTL: Joi.number().default(60_000), // 60 seconds
	THROTTLER_LIMIT: Joi.number().default(60),
	// Add your own configuration options here
});
