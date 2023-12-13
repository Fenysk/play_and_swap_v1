import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser } from 'src/users/decorator';
import { CreateOrderDto } from './dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('mine')
    async getMyOrders(@GetUser('sub') userId: string) {
        return await this.ordersService.getMyOrders(userId);
    }

    @Post('create')
    async createOrder(
        @GetUser('sub') userId: string,
        @Body() data: CreateOrderDto
    ) {
        return await this.ordersService.createOrder(userId, data);
    }

    @Put('update-status/:orderId')
    @HttpCode(HttpStatus.OK)
    async checkAndUpdateOrderStatus(
        @GetUser('sub') userId: string,
        @Param('orderId') orderId: string
    ) {
        return await this.ordersService.checkAndUpdateOrderStatus(userId, orderId);
    }

}
