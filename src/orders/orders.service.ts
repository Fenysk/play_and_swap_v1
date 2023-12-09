import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { CartService } from 'src/cart/cart.service';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService,
    ) { }

    async getMyOrders(userId: string) {
        const orders = await this.prismaService.order.findMany({
            where: { userId },
        });

        if (!orders.length)
            throw new NotFoundException('No orders found for this user');

        return orders;
    }

    async getOrderByIdWithDetails(orderId: string) {
        const order = await this.prismaService.order.findUniqueOrThrow({
            where: { id: orderId },
            include: {
                Cart: {
                    include: {
                        CartItem: {
                            include: {
                                Item: {
                                    include: {
                                        User: {
                                            include: {
                                                Addresses: true
                                            }
                                        }
                                    }
                                }
                            },
                        },
                    },
                },
            }
        });

        return order;
    }

    async getUserOrderByIdWithDetails(userId: string, orderId: string) {
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
                User: { id: userId },
            },
            include: {
                Cart: {
                    include: {
                        CartItem: {
                            include: {
                                Item: {
                                    include: {
                                        User: {
                                            include: {
                                                Addresses: true
                                            }
                                        }
                                    }
                                }
                            },
                        },
                    },
                },
            }
        });

        if (!order)
            throw new NotFoundException('Order not found');

        return order;
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const { cartId, addressId, relayId } = dto;

        const cart = await this.prismaService.cart.findUniqueOrThrow({
            where: { id: cartId },
            include: {
                CartItem: { include: { Item: true } },
                Order: true
            },
        });

        if (!cart.CartItem.length)
            throw new NotFoundException('Cart is empty');

        if (cart.Order)
            throw new ConflictException('Cart already ordered');

        const address = await this.prismaService.address.findUniqueOrThrow({
            where: { id: addressId, userId },
        });

        // TODO: check if relay exists

        const tax = 0;
        const amount = this.getCartTotalAmount(cart) * 100;
        const taxAmount = amount * tax;
        const totalAmount = amount + taxAmount;

        const order = await this.prismaService.order.create({
            data: {
                id: uuidv4(),
                amount,
                taxAmount,
                totalAmount,
                relayId,
                Address: { connect: { id: addressId } },
                User: { connect: { id: userId } },
                Cart: { connect: { id: cartId } },
            },
            include: { Cart: { include: { CartItem: { include: { Item: true } } } } }
        });

        const newCart = await this.cartService.createNewCart(userId);

        const paymentSession = await this.paymentService.createPaymentSession(userId, order)

        const updatedOrder = await this.prismaService.order.findUnique({
            where: { id: order.id },
            include: {
                Cart: { include: { CartItem: { include: { Item: true } } } },
                Payment: true
            }
        });

        return updatedOrder;
    }

    setShippingInfosToOrder(orderId: any, shippingInfos: any) {
        const updatedOrder = this.prismaService.order.update({
            where: { id: orderId },
            data: {
                expeditionNumber: shippingInfos.expeditionNumber,
                stickerUrl: shippingInfos.urlEtiquette,
                status: 'in_shipping'
            }
        });

        return updatedOrder;
    }

    getCartTotalAmount(cart: any): number {
        let amount = 0;
        for (const cartItem of cart.CartItem) {
            amount += Number((cartItem.Item.price).toString())
        }
        return amount;
    }

}
