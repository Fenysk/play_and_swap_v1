import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItemsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAllAvailableItems() {
        const items = await this.prismaService.item.findMany({
            where: { isVisible: true }
        });

        if (!items.length)
            throw new NotFoundException('No items found');

        return items;
    }

    async getMyItems(user_id: string) {
        const items = await this.prismaService.item.findMany({
            where: { userId: user_id }
        });

        if (!items.length)
            throw new NotFoundException('No items found');

        return items;
    }

    async getItemByIdWithDetails(item_id: string) {
        const item = await this.prismaService.item.findUniqueOrThrow({
            where: { id: item_id },
            include: { User: true }
        });

        return item;
    }

    async publishItem(user_id: string, createItemDto: CreateItemDto) {
        const item = await this.prismaService.item.create({
            data: {
                User: { connect: { id: user_id } },

                id: uuidv4(),
                name: createItemDto.name,
                description: createItemDto.description,
                state: createItemDto.state,
                price: createItemDto.price,
                images: createItemDto.images,
            }
        });

        return item;
    }

    async updateMyItem(user_id: string, item_id: string, data: any) {
        const updatedItem = await this.prismaService.item.update({
            where: { id: item_id, userId: user_id },
            data: {
                ...data
            }
        });

        return updatedItem;
    }

    async deleteMyItem(user_id: string, item_id: string) {
        const deletedItem = await this.prismaService.item.delete({
            where: { id: item_id, userId: user_id }
        });

        return 'Item deleted';
    }

}
