import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { ItemsModule } from './items/items.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        AuthModule,
        UsersModule,
        PrismaModule,
        EmailModule,
        ItemsModule,
        CartModule,
        OrdersModule,
        AddressesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
