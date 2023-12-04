import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    constructor(private readonly configService: ConfigService) { }

    createResendInstance(): any {
        const RESEND_API_KEY = this.configService.get<string>('RESEND_API_KEY');
        const resendInstance = new Resend(RESEND_API_KEY);

        return resendInstance;
    }

}
