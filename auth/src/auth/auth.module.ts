import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../database/prisma.service';
import { createAuth } from './auth.instance';
import type { EnvConfig } from '../config/env.validation';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      inject: [ConfigService, PrismaService],
      useFactory: (config: ConfigService<EnvConfig, true>, prisma: PrismaService) => ({
        auth: createAuth(prisma, {
          NODE_ENV: config.get('NODE_ENV', { infer: true }),
          CORS_ORIGINS: config.get('CORS_ORIGINS', { infer: true }),
          BETTER_AUTH_SECRET: config.get('BETTER_AUTH_SECRET', { infer: true }),
          BETTER_AUTH_URL: config.get('BETTER_AUTH_URL', { infer: true }),
          GOOGLE_CLIENT_ID: config.get('GOOGLE_CLIENT_ID', { infer: true }),
          GOOGLE_CLIENT_SECRET: config.get('GOOGLE_CLIENT_SECRET', { infer: true }),
        }),
      }),
    }),
  ],
})
export class AuthModule {}
