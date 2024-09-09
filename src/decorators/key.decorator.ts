import { SetMetadata } from "@nestjs/common";

export const KEY_KEY = "keys";
export const Key = (key: string) => SetMetadata(KEY_KEY, key)