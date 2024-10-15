import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  AUTHORIZATION_KEY: z.string(),
  DISCORD_WEBHOOK: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_USER_ID: z.string(),
  SPOTIFY_SECRET: z.string(),
  REDIS_URL: z.string(),
  CALLBACK_URL: z.string(),
  DISCORD_ID: z.string(),
  PORT: z.string().or(z.number()).default(3000)
});

type env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
