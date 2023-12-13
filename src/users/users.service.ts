import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from "argon2";
import { AddressesService } from 'src/addresses/addresses.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,

        @Inject(forwardRef(() => AddressesService))
        private readonly addressesService: AddressesService
    ) { }

    async getAllUsers(): Promise<object[]> {
        const users = await this.prismaService.user.findMany();

        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        users.forEach(user => delete user.hashedPassword);

        return users;
    }

    async getUserById(id: string): Promise<any> {
        const user = await this.prismaService.user.findUniqueOrThrow({
            where: { id },
            include: { Addresses: true }
        });

        const { hashedPassword, ...publicUser } = user;

        return publicUser;
    }

    async getUserByEmail(email: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { email }
        });

        return user;
    }

    async getUserByConfirmationId(confirmationId: string): Promise<any> {
        const user = await this.prismaService.user.findFirst({
            where: { confirmationId }
        });

        return user;
    }

    async createUser(data: InputUserDto): Promise<object> {
        const newCartId = uuidv4();

        const newUser = await this.prismaService.user.create({
            data: {
                id: uuidv4(),
                email: data.email,
                hashedPassword: data.hashedPassword,
                activeCartId: newCartId,

                Carts: {
                    create: { id: newCartId }
                }
            }
        });
        return newUser;
    }

    async updateUser(id: string, data: any): Promise<object> {
        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data
        });
        return updatedUser;
    }

    async updateMyPassword(id: string, data: any): Promise<object> {
        const { oldPassword, newPassword } = data;

        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        const isPasswordValid = await argon2.verify(user.hashedPassword, oldPassword);

        if (!isPasswordValid)
            throw new ForbiddenException('Error updating password');

        const hashedPassword = await argon2.hash(newPassword);

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: { hashedPassword }
        });

        return updatedUser;
    }

    async becomeSeller(userId: string, defaultSellerAddressId: string): Promise<object> {
        const user = await this.getUserById(userId);

        if (!user.firstName)
            throw new ForbiddenException('You must provide your first name before becoming a seller');

        if (!user.lastName)
            throw new ForbiddenException('You must provide your last name before becoming a seller');

        if (!user.phoneNumber)
            throw new ForbiddenException('You must provide your phone number before becoming a seller');

        if (user.roles.includes('SELLER'))
            throw new ConflictException('You are already a seller');

        const address = await this.addressesService.getAddressById(defaultSellerAddressId);

        const roles = [...user.roles, 'SELLER'];

        const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
            data: {
                defaultSellerAddressId,
                roles
            }
        });

        return updatedUser;
    }

    async deleteUser(id: string): Promise<string> {
        try {
            const deletedUser = await this.prismaService.user.delete({
                where: { id }
            });

            return `${deletedUser.email} deleted`;
        } catch (error) {
            console.log(error);
        }

    }
}
