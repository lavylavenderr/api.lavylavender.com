import { Controller, Get } from '@nestjs/common';
import { type Response } from './interfaces/response.interface';

@Controller()
export class AppController {
  @Get()
  baseRoute(): Response {
    return {
      statusCode: 200,
      message:
        "Welcome to Alexander's API! Reach out to them for documentation, or feel free to poke around.",
    };
  }
}
