import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { GetUser } from 'src/users/decorator';

@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('relay-points/:addressId')
    @HttpCode(HttpStatus.OK)
    async getRelayPointsArroundMe(
        @GetUser('sub') userId: string,
        @Param('addressId') addressId: string
    ) {
        return this.shippingService.getRelayPointsArroundMe(userId, addressId);
    }

}
