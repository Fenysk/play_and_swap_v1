import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
        JwtModule.register({}),
        UsersModule,
        EmailModule
    ],
    providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule { }
