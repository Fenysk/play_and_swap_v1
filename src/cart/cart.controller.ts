import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetUser, Roles } from 'src/users/decorator';
import { Role } from 'src/users/entities';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Roles(Role.USER)
    @Get('mine')
    async getMyLastCart(@GetUser('sub') userId: string): Promise<any> {
        return this.cartService.getMyLastCart(userId);
    }

    @Roles(Role.USER)
    @Post('new')
    async createNewCart(@GetUser('sub') userId: string): Promise<any> {
        return this.cartService.createNewCart(userId);
    }

    @Roles(Role.USER)
    @Post('add/:id')
    async addToCart(@GetUser('sub') userId: string, @Param('id') itemId: string): Promise<object> {
        return this.cartService.addToCart(userId, itemId);
    }

    @Roles(Role.USER)
    @Post('remove/:id')
    async removeFromCart(@GetUser('sub') userId: string, @Param('id') itemId: string): Promise<object> {
        return this.cartService.removeFromCart(userId, itemId);
    }

    @Roles(Role.USER)
    @Put('switch/:id')
    @HttpCode(HttpStatus.OK)
    async switchCart(@GetUser('sub') userId: string, @Param('id') cartId: string): Promise<string> {
        return this.cartService.switchCart(userId, cartId);
    }

}
