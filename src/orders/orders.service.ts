import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { CartService } from 'src/cart/cart.service';
import { PaymentService } from 'src/payment/payment.service';
import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';
import { ShippingService } from 'src/shipping/shipping.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cartService: CartService,

        @Inject(forwardRef(() => PaymentService)) private readonly paymentService: PaymentService,
        @Inject(forwardRef(() => ShippingService)) private readonly shippingService: ShippingService
    ) { }

    async getMyOrders(userId: string) {
        const orders = await this.prismaService.order.findMany({
            where: { userId },
            include: {
                Payment: true,
                Shipping: true
            }
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
                Payment: true,
                Shipping: true
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
                Payment: true,
                Shipping: true
            }
        });

        if (!order)
            throw new NotFoundException('Order not found');

        return order;
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const { cartId, addressId, carrierName, relayId } = dto;

        const cart = await this.prismaService.cart.findUniqueOrThrow({
            where: {
                id: cartId,
                Order: null
            },
            include: {
                CartItem: { include: { Item: true } },
                Order: true
            },
        });

        if (!cart.CartItem.length)
            throw new NotFoundException('Cart is empty');

        const address = await this.prismaService.address.findUniqueOrThrow({
            where: { id: addressId, userId },
        });

        if (!await this.shippingService.checkIfRelayPointExists(relayId))
            throw new NotFoundException('Relay point not found');

        const tax = 0;
        const cartAmount = this.getCartTotalAmount(cart) * 100;
        const taxAmount = cartAmount * tax;
        const totalAmount = cartAmount + taxAmount;

        const newOrder = await this.prismaService.order.create({
            data: {
                id: uuidv4().replace(/-/g, '').substring(0, 15),
                cartAmount,
                taxAmount,
                totalAmount,
                Address: { connect: { id: addressId } },
                User: { connect: { id: userId } },
                Cart: { connect: { id: cartId } },
                Payment: {
                    create: {
                        id: uuidv4(),
                        amountTotal: totalAmount
                    }
                },
                Shipping: {
                    create: {
                        id: uuidv4(),
                        relayId,
                        carrierName,
                    }
                }
            },
            include: {
                Cart: { include: { CartItem: { include: { Item: true } } } },
                Payment: true,
                Shipping: true
            }
        });

        const newCart = await this.cartService.createNewCart(userId);

        return newOrder;
    }

    getCartTotalAmount(cart: any): number {
        let totalAmount = 0;
        for (const cartItem of cart.CartItem) {
            totalAmount += Number((cartItem.Item.price).toString())
        }
        return totalAmount;
    }

    setShippingInfosToOrder(orderId: any, shippingInfos: any) {
        const updatedOrder = this.prismaService.order.update({
            where: { id: orderId },
            data: {
                Shipping: {
                    update: {
                        expeditionNumber: shippingInfos.expeditionNumber,
                        stickerUrl: shippingInfos.urlEtiquette
                    }
                }
            },
            include: {
                Payment: true,
                Shipping: true
            }
        });

        return updatedOrder;
    }

    async checkAndUpdateOrderStatus(userId: string, orderId: string) {
        const order = await this.getUserOrderByIdWithDetails(userId, orderId);

        await this.paymentService.checkAndUpdatePaymentStatus(orderId);
        await this.shippingService.checkAndUpdateShippingStatus(orderId);

        //// OrderStatus: PENDING, CANCELLED, FINISHED
        // set CANCELLED
        if (
            order.Payment?.status === PaymentStatus.EXPIRED ||
            order.Shipping.status === ShippingStatus.CANCELLED
        )
            return await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);

        // set FINISHED
        if (
            order.Payment?.status === PaymentStatus.COMPLETE &&
            order.Shipping.status === ShippingStatus.RETRIEVED
        )
            return await this.updateOrderStatus(orderId, OrderStatus.FINISHED);

        // set PENDING
        return await this.updateOrderStatus(orderId, OrderStatus.PENDING);

    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        const updatedOrder = await this.prismaService.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                Payment: true,
                Shipping: true
            }
        });
        return updatedOrder;
    }

}
