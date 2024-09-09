import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { Key } from 'src/decorators/key.decorator';
import { env } from 'src/lib/env';
import { Response } from 'src/interfaces/response.interface';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

@Controller('phone')
export class PhoneController {
  constructor(private phoneService: PhoneService) {}

  @Post('charge')
  @Key(env.AUTHORIZATION_KEY)
  async charge(@Req() request: Request): Promise<Response> {
    const headers = request.headers;
    const currentCharge = headers['x-current-charge'];
    const chargingState = headers['x-is-charging'];

    if (!currentCharge)
      throw new BadRequestException('Bad Request', {
        description: 'X-Current-Charge Header is missing',
      });
    if (!chargingState)
      throw new BadRequestException('Bad Request', {
        description: 'X-Is-Charging Header is missing',
      });

    const isCharging = chargingState == 1;

    await this.phoneService.webhook.execute({
      embeds: [
        {
          description: `<@988801425196867644> has ${
            isCharging ? 'plugged in their phone.' : 'unplugged their phone.'
          } Their battery is now at **${currentCharge}%**`,
          color: 0x967bb6,
        },
      ],
    });

    return {
      statusCode: 200,
      message: {
        currentCharge,
        isCharging,
      },
    };
  }

  @Post('alarm')
  @Key(env.AUTHORIZATION_KEY)
  async alarm(): Promise<Response> {
    await this.phoneService.webhook.execute({
      embeds: [
        {
          description: `<@988801425196867644>'s **${format(toZonedTime(new Date(), 'America/Los_Angeles'), 'hh:mm aa')}** alarm has gone off.`,
          color: 0x967bb6,
        },
      ],
    });

    return {
      statusCode: 200,
      message: 'Received',
    };
  }
}
