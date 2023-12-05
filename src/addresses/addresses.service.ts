import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AddressesService {
    constructor(private readonly prismaService: PrismaService) { }

    async getMyAddresses(userId: string) {
        const addresses = await this.prismaService.address.findMany({
            where: {
                userId,
            },
        });

        if (!addresses.length)
            throw new NotFoundException('No addresses found for this user');

        return addresses;
    }

    async createAddress(userId: string, data: any) {
        const address = await this.prismaService.address.create({
            data: {
                id: uuidv4(),
                numberAndStreet: data.numberAndStreet,
                city: data.city,
                zipCode: data.zipCode,
                state: data.state,
                country: data.country,
                User: { connect: { id: userId } },
            },
        });

        return address;
    }

    async deleteAddress(userId: string, id: string) {
        const address = await this.prismaService.address.findUnique({
            where: { id, },
        });

        if (!address)
            throw new NotFoundException('Address not found');

        if (address.userId !== userId)
            throw new NotFoundException('Address not found');

        await this.prismaService.address.delete({
            where: {
                id,
            },
        });

        return address;
    }
}
