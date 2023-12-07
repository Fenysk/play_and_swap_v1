import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './services/stripe.service';

@Module({
    controllers: [PaymentController],
    providers: [
        PaymentService,
        StripeService
    ],
    exports: [PaymentService]
})
export class PaymentModule { }
