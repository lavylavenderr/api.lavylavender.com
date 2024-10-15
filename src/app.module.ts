import { Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizationGuard } from './guards/authorization.guard';
import { PhoneModule } from './routers/phone/phone.module';
import { RandomModule } from './routers/random/random.module';
import { SpotifyModule } from './routers/spotify/spotify.module';
import { CacheModule } from '@nestjs/cache-manager';
import { env } from './lib/env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BadgeModule } from './routers/badge/badge.module';

@Module({
  imports: [
    PhoneModule,
    RandomModule,
    SpotifyModule,
    BadgeModule,
    CacheModule.register<RedisClientOptions>({
      // Unsure why I have to do this, types are stupid :(
      // @ts-ignore
      imports: [ConfigModule],
      inject: [ConfigService],
      url: env.REDIS_URL,
      store: redisStore,
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})

export class AppModule {}
