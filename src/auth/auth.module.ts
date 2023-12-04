import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [UsersModule, JwtModule.register({})],
    providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule { }
