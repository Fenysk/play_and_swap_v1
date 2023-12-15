import { Module, forwardRef } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ThrottlerModule.forRootAsync({
            imports: [forwardRef(() => UploadModule)],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ([{
                ttl: configService.getOrThrow('THROTTLE_TTL'),
                limit: configService.getOrThrow('THROTTLE_LIMIT'),
            }]),
        }),
    ],
    providers: [
        UploadService,
        {
            provide: 'APP_GUARD',
            useClass: ThrottlerGuard,
        }
    ],
    controllers: [UploadController]
})
export class UploadModule { }
