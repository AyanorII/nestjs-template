import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { DatabaseError } from "pg";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status: HttpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		if (exception instanceof HttpException) {
			response.status(status).json(exception.getResponse());

			return;
		}

		if (exception instanceof DatabaseError) {
			response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				message: exception.message,
				error: exception.detail,
			});

			return;
		}

		response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			error: "Internal Server Error",
			message: "Something went wrong",
		});
	}
}
