import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
        EmailModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
