import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { AddressesModule } from 'src/addresses/addresses.module';
import { MondialRelayPointsService } from './services/mondial-relay-points.service';
import { SoapService } from './services/soap.service';

@Module({
    imports: [
        AddressesModule
    ],
    controllers: [ShippingController],
    providers: [
        ShippingService,
        MondialRelayPointsService,
        SoapService
    ]
})
export class ShippingModule { }
