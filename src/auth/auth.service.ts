import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from "argon2";
import { Tokens } from './types';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }

    async register(registerDto: RegisterDto): Promise<Tokens> {
        const hashedPassword = await argon2.hash(registerDto.password);
        const email = registerDto.email;

        const newUser: any = await this.userService.createUser({
            email,
            hashedPassword
        });

        // TODO: Send email confirmation

        const tokens = await this.getTokens(newUser);
        await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

        return tokens;
    }

    async login(loginDto: LoginDto): Promise<Tokens> {
        const user = await this.userService.getUserByEmail(loginDto.email);

        if (!user)
            throw new ForbiddenException('Access denied');

        const isPasswordValid = await argon2.verify(user?.hashedPassword, loginDto.password);

        if (!isPasswordValid)
            throw new ForbiddenException('Access denied');

        delete user.hashedPassword;

        const tokens = await this.getTokens(user);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return tokens;
    }

    async disconnect(userId: string): Promise<void> {
        await this.userService.updateUser(userId, {
            refreshToken: null
        });
    }

    async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
        const user: any = await this.userService.getUserById(userId);

        if (!user?.refreshToken)
            throw new ForbiddenException('Access denied');

        const isRefreshTokenValid = await argon2.verify(user.refreshToken, refreshToken);

        if (!isRefreshTokenValid)
            throw new ForbiddenException('Access denied');

        const tokens = await this.getTokens(user);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return tokens;
    }





    async getTokens(user: any): Promise<Tokens> {
        const payload = {
            sub: user.id,
            email: user.email
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: this.configService.get('JWT_ACCESS_SECRET')
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
            secret: this.configService.get('JWT_REFRESH_SECRET')
        });

        const tokens = { accessToken, refreshToken };

        return tokens;
    }

    async updateRefreshTokenHash(id: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await argon2.hash(refreshToken);

        await this.userService.updateUser(id, {
            refreshToken: hashedRefreshToken
        });
    }

}
