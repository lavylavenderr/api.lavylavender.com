import { Controller, Get } from "@nestjs/common";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Response } from 'src/interfaces/response.interface';

@Controller('random')
export class RandomController {
    constructor() {}

    @Get('time')
    async time(): Promise<Response> {
        const dateString = format(toZonedTime(new Date(), "America/Los_Angeles"), "MM/dd/yyyy");
        const timeString = format(toZonedTime(new Date(), 'America/Los_Angeles'), 'HH:mm')
        const ISOTimeString = toZonedTime(new Date(), "America/Los_Angeles")

        return {
            statusCode: 200,
            message: {
                date: dateString,
                time: timeString,
                isoString: ISOTimeString
            }
        }
    }
}