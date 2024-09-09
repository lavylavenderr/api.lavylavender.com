import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  AUTHORIZATION_KEY: z.string(),
  DISCORD_WEBHOOK: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_SECRET: z.string(),
});

type env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
