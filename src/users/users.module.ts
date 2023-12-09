import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AddressesModule } from 'src/addresses/addresses.module';

@Module({
    imports: [
        forwardRef(() => AddressesModule)
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule { }
