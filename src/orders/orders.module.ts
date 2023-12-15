import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from 'src/cart/cart.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ShippingModule } from 'src/shipping/shipping.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        CartModule,
        UsersModule,

        forwardRef(() => PaymentModule),
        forwardRef(() => ShippingModule)
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService]
})
export class OrdersModule { }
