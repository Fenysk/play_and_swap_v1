import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemsService } from 'src/items/items.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService
    ) { }

    async getMyLastCart(userId: string): Promise<any> {
        const user = await this.usersService.getUserById(userId);

        const currentCart = await this.prismaService.cart.findUnique({
            where: { id: user.activeCartId },
            include: {
                CartItem: {
                    include: {
                        Item: true
                    }
                }
            }
        });

        return currentCart;
    }

    async createNewCart(userId: string): Promise<string> {
        const cart = await this.prismaService.cart.create({
            data: {
                id: uuidv4(),
                User: {
                    connect: { id: userId }
                }
            }
        });

        const updatedUser = await this.usersService.updateUser(userId,
            { activeCartId: cart.id }
        )

        return 'New cart created';
    }

    async addToCart(userId: string, itemId: string): Promise<object> {
        const user = await this.usersService.getUserById(userId);

        const userCart = await this.prismaService.cart.findUnique({
            where: { id: user.activeCartId }
        });

        const item = await this.itemsService.getItemByIdWithDetails(itemId);

        // Check if item is not from the same user
        if (item.User.id === userId)
            throw new ConflictException('You cannot add your own item to your cart');

        const updatedCart = await this.prismaService.cart.update({
            where: {
                id: userCart.id
            },
            data: {
                CartItem: {
                    create: {
                        id: uuidv4(),
                        Item: {
                            connect: { id: itemId }
                        }
                    }
                }
            }
        });

        return updatedCart;
    }

    async removeFromCart(userId: string, itemId: string): Promise<object> {
        const user = await this.usersService.getUserById(userId);

        const userCart = await this.prismaService.cart.findUnique({
            where: { id: user.activeCartId },
            include: {
                CartItem: {
                    include: {
                        Item: true
                    }
                }
            }
        });

        if (!userCart.CartItem.some(cartItem => cartItem.Item.id === itemId))
            throw new NotFoundException('Item not found in cart');

        const updatedCart = await this.prismaService.cart.update({
            where: {
                id: userCart.id
            },
            data: {
                CartItem: {
                    delete: {
                        cartId_itemId: {
                            cartId: userCart.id,
                            itemId
                        }
                    }
                }
            }
        });

        return updatedCart;
    }

    async switchCart(userId: string, cartId: string): Promise<string> {
        const cart = await this.prismaService.cart.findUniqueOrThrow({
            where: { id: cartId },
            include: { Order: true }
        });

        if (cart.Order)
            throw new ForbiddenException('You cannot switch to a cart that has already been ordered');

        const updatedUser = await this.usersService.updateUser(userId,
            { activeCartId: cartId }
        );

        return 'Cart switched';
    }

}
