import { Injectable } from '@nestjs/common';
import DiscordWebhook from 'discord-webhook-ts';
import { env } from 'src/lib/env';

@Injectable()
export class PhoneService {
  public readonly webhook: DiscordWebhook = new DiscordWebhook(
    env.DISCORD_WEBHOOK,
  );
}