import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { AddressesModule } from 'src/addresses/addresses.module';
import { MondialRelayPointsService } from './services/mondial-relay/mondial-relay-points.service';
import { SoapService } from './services/soap.service';
import { MondialRelayExpeditionService } from './services/mondial-relay/mondial-relay-expedition.service';
import { OrdersModule } from 'src/orders/orders.module';
import { MondialRelayPricesService } from './services/mondial-relay/mondial-relay-prices.service';
import { Md5HashService } from './services/md5-hash.service';

@Module({
    imports: [
        AddressesModule,
        OrdersModule
    ],
    controllers: [ShippingController],
    providers: [
        ShippingService,
        MondialRelayPointsService,
        MondialRelayExpeditionService,
        MondialRelayPricesService,
        Md5HashService,
        SoapService
    ]
})
export class ShippingModule { }
