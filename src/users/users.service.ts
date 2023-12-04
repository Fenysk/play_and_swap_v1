import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllUsers(): Promise<object[]> {
        const users = await this.prisma.user.findMany();

        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        users.forEach(user => delete user.hashedPassword);

        return users;
    }

    async getUserById(id: string): Promise<object> {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id }
        });

        const { hashedPassword, ...publicUser } = user;

        return publicUser;
    }

    async getUserByEmail(email: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        return user;
    }

    async createUser(data: InputUserDto): Promise<object> {
        const newUser = await this.prisma.user.create({
            data: {
                id: uuidv4(),
                email: data.email,
                hashedPassword: data.hashedPassword,
            }
        });
        return newUser;
    }

    async updateUser(id: string, data: any): Promise<object> {
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data
        });
        return updatedUser;
    }

    async deleteUser(id: string): Promise<string> {
        const deletedUser = await this.prisma.user.delete({
            where: { id }
        });
        return `${deletedUser.email} deleted`;
    }
}
