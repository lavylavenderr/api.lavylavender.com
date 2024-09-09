import { Module } from "@nestjs/common";
import { RandomController } from "./random.controller";

@Module({
    controllers: [RandomController],
})
export class RandomModule {}