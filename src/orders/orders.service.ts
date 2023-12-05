import { Injectable, NotFoundException } from '@nestjs/common';
import { Cart } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cartService: CartService,
    ) { }

    async getMyOrders(userId: string) {
        const orders = await this.prismaService.order.findMany({
            where: {
                userId,
            },
        });

        if (!orders.length)
            throw new NotFoundException('No orders found for this user');

        return orders;
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const { cartId, addressId } = dto;

        const cart = await this.prismaService.cart.findUnique({
            where: { id: cartId },
            include: { CartItem: { include: { Item: true } } },
        });

        if (!cart)
            throw new NotFoundException('Cart not found');

        if (!cart.CartItem.length)
            throw new NotFoundException('Cart is empty');

        const address = await this.prismaService.address.findUnique({
            where: { id: addressId, userId },
        });

        const tax = 0;
        const amount = this.getAmount(cart) * 100;
        const taxAmount = amount * tax;
        const totalAmount = amount + taxAmount;

        const order = await this.prismaService.order.create({
            data: {
                id: uuidv4(),
                amount,
                taxAmount,
                totalAmount,
                Address: { connect: { id: addressId } },
                User: { connect: { id: userId } },
                Cart: { connect: { id: cartId } },
            },
        });

        const newCart = await this.cartService.createNewCart(userId);

        return order;
    }

    getAmount(cart: any): number {
        let amount = 0;
        for (const cartItem of cart.CartItem) {
            amount += Number((cartItem.Item.price).toString())
        }
        return amount;
    }

}
