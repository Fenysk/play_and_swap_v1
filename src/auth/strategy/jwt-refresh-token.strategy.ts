import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { Request } from "express";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh'
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true
        })
    }

    async validate(req: Request, payload: any) {

        const user = await this.prismaService.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user)
            throw new ForbiddenException('Access denied');

        const refreshToken = req.get('authorization').replace('Bearer ', '').trim();
        return { ...payload, refreshToken };
    }
}
