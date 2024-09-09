import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import { Response } from 'src/interfaces/response.interface';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { env } from 'src/lib/env';

@Controller('spotify')
export class SpotifyController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('search?')
  async search(@Query('query') query: string): Promise<Response> {
    await this.cacheManager.set('lavender', 'foxxo', 0);
    const testVal = await this.cacheManager.get('lavender');

    return {
      statusCode: 200,
      message: {
        cacheManager: testVal,
        query: query,
      },
    };
  }

  @Get('login')
  @Redirect()
  async login() {
    const redirectUrl = 'http://localhost:3000/spotify/callback';
    const scopes = ['user-top-read'];
    const searchParams = new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUrl,
      scopes: scopes.join(','),
    });
    const spotifyLoginURL =
      'https://accounts.spotify.com/authorize?' + searchParams;

    return {
      url: spotifyLoginURL,
    };
  }

  @Get('callback?')
  async spotifyCallback(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Bad Request', {
        description: 'Callback Code is missing',
      });
    }

    const redirectUrl = 'http://localhost:3000/spotify/callback';
    const encodedCredentials = btoa(
      `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_SECRET}`,
    );

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl,
          code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || 'Token request failed');
      }

      await this.cacheManager.set('spotifyAccess', data.access_token, 0);
      await this.cacheManager.set('spotifyRefresh', data.refresh_token, 0);

      return {
        statusCode: 200,
        message: 'Successfully logged in.',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message || 'Invalid Response from Token Server',
      };
    }
  }
}
