import { Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { GetUser } from 'src/users/decorator';

@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('relay-points/default')
    @HttpCode(HttpStatus.OK)
    async getRelayPointsArroundMeByDefaultAddress(
        @GetUser('sub') userId: string
    ) {
        return this.shippingService.getRelayPointsArroundMeByDefaultCustomerAddress(userId);
    }

    @Post('relay-points/:addressId')
    @HttpCode(HttpStatus.OK)
    async getRelayPointsArroundMeByAddressId(
        @GetUser('sub') userId: string,
        @Param('addressId') addressId: string
    ) {
        return this.shippingService.getRelayPointsArroundMeByAddressId(userId, addressId);
    }

    @Post('create-expedition/:orderId')
    @HttpCode(HttpStatus.OK)
    async createExpedition(
        @Param('orderId') orderId: string
    ) {
        return this.shippingService.createRelayExpedition(orderId);
    }

    @Get('check-expedition/:expeditionNumber')
    @HttpCode(HttpStatus.OK)
    async checkRelayExpedition(
        @Param('expeditionNumber') expeditionNumber: string
    ) {
        return this.shippingService.checkRelayExpedition(expeditionNumber);
    }

}
