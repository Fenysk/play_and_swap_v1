import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    async createOrder(@GetUser('sub') userId: string, @Body() data: CreateOrderDto) {
        return await this.ordersService.createOrder(userId, data);
    }

}
