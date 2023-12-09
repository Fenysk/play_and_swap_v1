import { Injectable } from "@nestjs/common";
import { SoapService } from "./soap.service";
import { ConfigService } from "@nestjs/config";
import { OrdersService } from "src/orders/orders.service";

@Injectable()
export class MondialRelayPricesService {
    constructor(
        private readonly soapService: SoapService,
        private readonly configService: ConfigService,
        private readonly odersService: OrdersService
    ) { }

}
