import { Module, forwardRef } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        forwardRef(() => UsersModule)
    ],
    controllers: [AddressesController],
    providers: [AddressesService],
    exports: [AddressesService],
})
export class AddressesModule { }
