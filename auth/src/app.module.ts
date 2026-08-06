import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined // production: raw JSON lines shipped to Loki/ELK
            : { target: 'pino-pretty', options: { singleLine: true } },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        customProps: () => ({ context: 'HTTP' }),
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    // Remaining feature modules (catalog, cart, orders, ...) are added here
    // as each milestone lands.
  ],
})
export class AppModule {}
