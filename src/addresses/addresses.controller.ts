import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { GetUser } from 'src/users/decorator';

@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Get('mine')
    async getMyAddresses(@GetUser('sub') userId: string) {
        return await this.addressesService.getMyAddresses(userId);
    }

    @Post('new')
    async createAddress(@GetUser('sub') userId: string, @Body() data: any) {
        return await this.addressesService.createAddress(userId, data);
    }

    @Delete('delete/:id')
    async deleteAddress(@GetUser('sub') userId: string, @Param('id') id: string) {
        return await this.addressesService.deleteAddress(userId, id);
    }

}
