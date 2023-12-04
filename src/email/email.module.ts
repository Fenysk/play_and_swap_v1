import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendService } from './services/resend.service';
import { TemplateService } from './services/template.service';

@Module({
    providers: [
        EmailService,
        ResendService,
        TemplateService
    ],
    exports: [EmailService],
})
export class EmailModule { }
