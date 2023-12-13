import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GetUser } from 'src/users/decorator';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('session/create/:orderId')
    async createPaymentSession(
        @GetUser('sub') userId: string,
        @Param('orderId') orderId: string
    ): Promise<any> {
        return await this.paymentService.createPaymentSession(userId, orderId);
    }

    @Get('session/retrieve/:sessionId')
    async retrievePaymentSession(@Param('sessionId') paymentSessionId: string): Promise<any> {
        return await this.paymentService.retrievePaymentSession(paymentSessionId);
    }

    @Get('session/:orderId')
    async getPaymentSession(@Param('orderId') orderId: string): Promise<any> {
        return await this.paymentService.getPaymentSession(orderId);
    }

}
