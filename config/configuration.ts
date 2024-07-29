import * as Joi from "joi";

export interface Config {
	// App
	PORT: number;
	NODE_ENV: string;
	CORS_ORIGIN: string;
	THROTTLER_TTL: number;
	THROTTLER_LIMIT: number;
	SESSION_SECRET: string;

	// Database
	DB_HOST: string;
	DB_USER: string;
	DB_PASSWORD: string;
	DB_NAME: string;
	DATABASE_URL: string;

	// JWT
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
	REFRESH_TOKEN_SECRET: string;
	REFRESH_TOKEN_EXPIRES_IN: string;

	// OAuth providers
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_CALLBACK_URL: string;

	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	GITHUB_CALLBACK_URL: string;

	// Mailer
	MAIL_USER: string;
	MAIL_PASSWORD: string;
	MAIL_HOST: string;
	MAIL_PORT: number;
}

export const configSchema = Joi.object<Config>({
	//App
	PORT: Joi.number().default(8000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),
	CORS_ORIGIN: Joi.string().required(),
	THROTTLER_TTL: Joi.number().default(60_000), // 60 seconds
	THROTTLER_LIMIT: Joi.number().default(60),
	SESSION_SECRET: Joi.string().required(),

	// Database
	DB_HOST: Joi.string().required(),
	DB_USER: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_NAME: Joi.string().required(),
	DATABASE_URL: Joi.string().required(),

	// JWT
	JWT_SECRET: Joi.string().required(),
	JWT_EXPIRES_IN: Joi.string().required(),
	REFRESH_TOKEN_SECRET: Joi.string().required(),
	REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),

	// OAuth providers
	GOOGLE_CLIENT_ID: Joi.string().required(),
	GOOGLE_CLIENT_SECRET: Joi.string().required(),
	GOOGLE_CALLBACK_URL: Joi.string().required(),

	GITHUB_CLIENT_ID: Joi.string().required(),
	GITHUB_CLIENT_SECRET: Joi.string().required(),
	GITHUB_CALLBACK_URL: Joi.string().required(),

	// Mailer
	MAIL_USER: Joi.string().required(),
	MAIL_PASSWORD: Joi.string().required(),
	MAIL_HOST: Joi.string().required(),
	MAIL_PORT: Joi.number().required(),
});
