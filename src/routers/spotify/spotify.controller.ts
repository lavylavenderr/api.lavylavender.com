import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Get,
  Inject,
  Query,
  Redirect,
  Injectable,
} from '@nestjs/common';
import { Response } from 'src/interfaces/response.interface';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { env } from 'src/lib/env';
import { SpotifyService } from './spotify.service';

interface ITokenObj {
  token: string;
  storedAt: number;
}

@Controller('spotify')
@Injectable()
export class SpotifyController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private spotifyService: SpotifyService,
  ) {}

  @Get('search?')
  async search(@Query('query') query: string): Promise<Response> {
    const refreshToken = (await this.cacheManager.get('spotifyRefresh')) as
      | string
      | null;
    let accessToken = JSON.parse(
      (await this.cacheManager.get('spotifyAccess')) ?? '{}',
    ) as ITokenObj;

    if (!accessToken.token || !refreshToken) {
      throw new InternalServerErrorException('Server Error', {
        description: 'No Token Stored',
      });
    } else if (
      Math.floor(accessToken.storedAt / 1000) <
      Math.floor(Date.now() / 1000) - 3600
    ) {
      accessToken = await this.spotifyService.refreshTokens(
        refreshToken,
        this.cacheManager,
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
      {
        headers: {
          Authorization: 'Bearer ' + accessToken.token,
        },
      },
    );

    if (response.status == 401) {
      throw new InternalServerErrorException('Server Error', {
        description: 'Invalid Response from Spotify',
      });
    }

    const data = await response.json();
    const filteredTracks = [];

    for (const track of data.tracks.items) {
      filteredTracks.push({
        artists: track.artists,
        track: track.name,
        album_covers: track.album.images,
        spotifyId: track.id,
      });
    }

    return {
      statusCode: 200,
      message: {
        data: filteredTracks,
        query: query,
      },
    };
  }

  @Get('topTracks')
  async topTracks() {
    const refreshToken = (await this.cacheManager.get('spotifyRefresh')) as
      | string
      | null;
    let accessToken = JSON.parse(
      (await this.cacheManager.get('spotifyAccess')) ?? '{}',
    ) as ITokenObj;

    if (!accessToken.token || !refreshToken) {
      throw new InternalServerErrorException('Server Error', {
        description: 'No Token Stored',
      });
    } else if (
      Math.floor(accessToken.storedAt / 1000) <
      Math.floor(Date.now() / 1000) - 3600
    ) {
      accessToken = await this.spotifyService.refreshTokens(
        refreshToken,
        this.cacheManager,
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term`,
      {
        headers: {
          Authorization: 'Bearer ' + accessToken.token,
        },
      },
    );

    if (response.status == 401) {
      throw new InternalServerErrorException('Server Error', {
        description: 'Invalid Response from Spotify',
      });
    }

    const data = await response.json();
    const filteredTracks = [];
    
    for (const track of data.items) {
      filteredTracks.push({
        artists: track.artists,
        track: track.name,
        album_covers: track.album.images,
        spotifyId: track.id,
      });
    }

    return {
      statusCode: 200,
      message: {
        data: filteredTracks,
      },
    };
  }

  @Get('login')
  @Redirect()
  async login() {
    const redirectUrl = env.CALLBACK_URL;
    const searchParams = new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUrl,
      scope: 'user-top-read',
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

    const redirectUrl = env.CALLBACK_URL;
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

      const response2 = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const data2 = await response2.json();

      if (data2.id !== env.SPOTIFY_USER_ID) {
        throw new BadRequestException('Invalid User', {
          description: 'You are not authorized to sign into this service.',
        });
      }

      await this.cacheManager.set('spotifyRefresh', data.refresh_token, 0);
      await this.cacheManager.set(
        'spotifyAccess',
        JSON.stringify({
          token: data.access_token,
          storedAt: Date.now(),
        }),
        0,
      );

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
