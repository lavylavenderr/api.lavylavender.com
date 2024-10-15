import { Controller, Get, Req } from '@nestjs/common';
import { Response } from 'src/interfaces/response.interface';
import { env } from 'src/lib/env';

@Controller('badge')
export class BadgeController {
  constructor() {}

  @Get('spotify')
  async spotify() {
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/` + env.DISCORD_ID,
    );
    const body = await response.json();

    return {
      schemaVersion: 1,
      namedLogo: 'spotify',
      logoColor: 'white',
      color: '1db954',
      label: 'listening to',
      message: body.data.listening_to_spotify
        ? `${body.data.spotify.song} by ${body.data.spotify.artist}`
        : 'nothing :3',
    };
  }

  @Get('status')
  async status() {
    let color: string = null;
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/` + env.DISCORD_ID,
    );
    const body = await response.json();

    switch (body.data.discord_status) {
      case 'online':
        color = 'green';
      case 'idle':
        color = 'yellow';
      case 'dnd':
        color = 'red';
      case 'offline':
        color = 'lightgrey';
    }

    return {
      schemaVersion: 1,
      color,
      label: 'currently',
      message: body.data.discord_status,
    };
  }

  @Get('playing')
  async playing() {
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/` + env.DISCORD_ID,
    );
    const body = await response.json();
    const activityArray = body.data.activities;

    let filteredActivity;

    for (const activity of activityArray) {
      if (
        activity.type === 0 &&
        activity.application_id !== '782685898163617802'
      ) {
        filteredActivity = activity;
      }
    }

    return {
      schemaVersion: 1,
      color: '5865F2',
      label: 'playing',
      message: filteredActivity ? filteredActivity.name : 'nothing :3',
    };
  }
}
