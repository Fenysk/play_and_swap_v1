import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './services/stripe.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
    imports: [
        forwardRef(() => OrdersModule)
    ],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        StripeService
    ],
    exports: [PaymentService]
})
export class PaymentModule { }
