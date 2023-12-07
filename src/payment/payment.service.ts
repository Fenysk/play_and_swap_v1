import { Injectable } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly prismService: PrismaService
    ) { }

    async createPaymentSession(userId: string, order: any): Promise<any> {

        const session = await this.stripeService.createPaymentSession(order);

        const paymentSession = await this.prismService.payment.create({
            data: {
                id: uuidv4(),

                sessionId: session.id,
                sessionUrl: session.url,
                status: session.status,

                currency: session.currency,
                amountTotal: session.amount_total,
                paymentStatus: session.payment_status,

                Order: { connect: { id: order.id } }
            }
        });

        return paymentSession;
    }

    async getPaymentSession(paymentSessionId: string): Promise<any> {
        const session = await this.stripeService.getPaymentSession(paymentSessionId);

        return session;
    }

    async verifyPaymentStatus(paymentId: string): Promise<any> {
        const payment = await this.prismService.payment.findUniqueOrThrow({
            where: { id: paymentId }
        });

        const session = await this.stripeService.getPaymentSession(payment.sessionId);

        const updatedPayment = await this.prismService.payment.update({
            where: { id: paymentId },
            data: {
                sessionUrl: session.url,
                status: session.status,
                paymentStatus: session.payment_status
            }
        });

        return updatedPayment;
    }

}
