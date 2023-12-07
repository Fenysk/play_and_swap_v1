import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ItemsService } from './items.service';
import { GetUser, Roles } from 'src/users/decorator';
import { Role } from 'src/users/entities';
import { CreateItemDto } from './dto';
import { Public } from 'src/auth/decorator';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Public()
    @Get('all')
    getAllItems() {
        return this.itemsService.getAllAvailableItems();
    }

    @Roles(Role.USER)
    @Get('mine')
    getMyItems(@GetUser('sub') user_id: any) {
        return this.itemsService.getMyItems(user_id);
    }

    @Roles(Role.USER)
    @Post('publish')
    publishItem(@GetUser('sub') user_id: any, @Body() createItemDto: CreateItemDto) {
        return this.itemsService.publishItem(user_id, createItemDto);
    }

    @Roles(Role.USER)
    @Put('update/mine/:id')
    updateMyItem(@GetUser('sub') user_id: any, @Param('id') item_id: string, @Body() data: any) {
        return this.itemsService.updateMyItem(user_id, item_id, data);
    }    

    @Roles(Role.USER)
    @Delete('delete/mine/:id')
    deleteMyItem(@GetUser('sub') user_id: any, @Param('id') item_id: string) {
        return this.itemsService.deleteMyItem(user_id, item_id);
    }

}
