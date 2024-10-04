import { SpotifyController } from './spotify.controller';
import { Module } from "@nestjs/common";
import { SpotifyService } from './spotify.service';

@Module({
    controllers: [SpotifyController],
    providers: [SpotifyService]
})
export class SpotifyModule {}