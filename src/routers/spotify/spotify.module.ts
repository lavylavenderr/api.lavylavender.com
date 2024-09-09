import { SpotifyController } from './spotify.controller';
import { Module } from "@nestjs/common";

@Module({
    controllers: [SpotifyController],
})
export class SpotifyModule {}