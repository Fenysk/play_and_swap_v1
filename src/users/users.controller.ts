import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser, Roles } from './decorator';
import { Role } from './entities';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(Role.ADMIN)
    @Get()
    async getAllUsers(): Promise<object[]> {
        return await this.usersService.getAllUsers();
    }

    @Get('me')
    async getMe(@GetUser() user: any): Promise<object> {
        return user;
    }

    @Roles(Role.ADMIN)
    @Get(':user_id')
    async getUserById(@Param('user_id') user_id: string): Promise<object> {
        return await this.usersService.getUserById(user_id);
    }

    @Roles(Role.ADMIN)
    @Post('create')
    async createUser(@Body() data: any): Promise<object> {
        return await this.usersService.createUser(data);
    }

    @Roles(Role.USER)
    @Put('update/me')
    @HttpCode(HttpStatus.OK)
    async updateMe(@GetUser('sub') user_id: any, @Body() data: any): Promise<object> {
        return await this.usersService.updateUser(user_id, data);
    }

    @Roles(Role.USER)
    @Put('update/become-seller')
    @HttpCode(HttpStatus.OK)
    async becomeSeller(@GetUser('sub') user_id: any, @Body('defaultSellerAddressId') defaultSellerAddressId: string): Promise<object> {
        return await this.usersService.becomeSeller(user_id, defaultSellerAddressId);
    }

    @Roles(Role.ADMIN)
    @Put('update/:user_id')
    @HttpCode(HttpStatus.OK)
    async updateUser(@Param('user_id') user_id: string, @Body() data: any): Promise<object> {
        return await this.usersService.updateUser(user_id, data);
    }

    @Roles(Role.USER)
    @Put('update/password/me')
    @HttpCode(HttpStatus.OK)
    async updateMyPassword(@GetUser('sub') user_id: string, @Body() data: any): Promise<object> {
        return await this.usersService.updateMyPassword(user_id, data);
    }

    @Roles(Role.ADMIN)
    @Delete(':user_id')
    async deleteUser(@Param('user_id') user_id: string): Promise<string> {
        return await this.usersService.deleteUser(user_id);
    }

    @Roles(Role.USER)
    @Delete('delete/me')
    async deleteMyAccount(@GetUser('sub') user_id: string): Promise<string> {
        return await this.usersService.deleteUser(user_id);
    }

}
