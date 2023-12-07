import { Injectable } from '@nestjs/common';
import { AddressesService } from 'src/addresses/addresses.service';
import { MondialRelayPointsService } from './services/mondial-relay-points.service';

@Injectable()
export class ShippingService {

    constructor(
        private readonly addressesService: AddressesService,
        private readonly mondialRelayPointsService: MondialRelayPointsService
    ) { }

    async getRelayPointsArroundMe(userId: string, addressId: string) {
        const address = await this.addressesService.getMyAddressById(userId, addressId);

        const relayPoints = await this.mondialRelayPointsService.getMondialRelayPointsArroundMe(address);

        return relayPoints;
    }

}
