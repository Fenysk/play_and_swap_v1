import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-access'
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_ACCESS_SECRET')
        })
    }

    async validate(payload: any) {
        const user = await this.prismaService.user.findUnique({ where: { id: payload.sub } });

        if (!user)
            throw new ForbiddenException('Access denied');

        const response = {
            ...payload,
            roles: user.roles,
        }

        return response;
    }
}
