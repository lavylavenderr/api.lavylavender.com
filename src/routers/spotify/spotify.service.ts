import { Injectable } from '@nestjs/common';
import { env } from 'src/lib/env';

@Injectable()
export class SpotifyService {
  public async refreshTokens(refreshToken: string, cacheManager: any) {
    const encodedCredentials = btoa(
      `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_SECRET}`,
    );

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const data = await response.json();

    await cacheManager.set(
      'spotifyAccess',
      JSON.stringify({
        token: data.access_token,
        storedAt: Date.now(),
      }),
      0,
    );

    return {
      token: data.access_token,
      storedAt: Date.now(),
    };
  }
}
