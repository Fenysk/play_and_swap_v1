import { ForbiddenException, Injectable } from '@nestjs/common';
import { AddressesService } from 'src/addresses/addresses.service';
import { MondialRelayPointsService } from './services/mondial-relay/mondial-relay-points.service';
import { MondialRelayExpeditionService } from './services/mondial-relay/mondial-relay-expedition.service';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class ShippingService {

    constructor(
        private readonly addressesService: AddressesService,
        private readonly ordersService: OrdersService,
        private readonly mondialRelayPointsService: MondialRelayPointsService,
        private readonly mondialRelayExpeditionService: MondialRelayExpeditionService,
    ) { }

    async getRelayPointsArroundMeByAddressId(userId: string, addressId: string) {
        const address = await this.addressesService.getMyAddressById(userId, addressId);

        const relayPoints = await this.mondialRelayPointsService.getMondialRelayPointsArroundMe(address);

        return relayPoints;
    }

    async getRelayPointsArroundMeByDefaultCustomerAddress(userId: string) {
        const address = await this.addressesService.getMyDefaultCustomerAddress(userId);

        const relayPoints = await this.mondialRelayPointsService.getMondialRelayPointsArroundMe(address);

        return relayPoints;
    }

    async createRelayExpedition(orderId: string) {
        const order = await this.ordersService.getOrderByIdWithDetails(orderId);

        // TODO: check if payment is done

        // TODO: check if order is not already shipped
        const notValidStatus = ['in_shipping', 'delivered', 'canceled'];
        if (notValidStatus.includes(order.status))
            throw new ForbiddenException('Order is already shipped or canceled');

        const expeditionAddressId = order.Cart.CartItem[0].Item.User.defaultSellerAddressId;
        const destinationAddressId = order.addressId;

        const expeditionAddress = await this.addressesService.getAddressById(expeditionAddressId);
        const destinationAddress = await this.addressesService.getAddressById(destinationAddressId);

        const relayPoints = await this.mondialRelayPointsService.getMondialRelayPointsArroundMe(expeditionAddress);

        const expeditionInfos = {
            firstName: expeditionAddress.User.firstName,
            lastName: expeditionAddress.User.lastName,
            numberAndStreet: expeditionAddress.numberAndStreet,
            city: expeditionAddress.city,
            zipCode: expeditionAddress.zipCode,
            country: expeditionAddress.country,
            phoneNumber: expeditionAddress.User.phoneNumber,
            email: expeditionAddress.User.email,
            relayId: relayPoints[0].id,
        }

        const destinationInfos = {
            userId: destinationAddress.User.id,
            firstName: destinationAddress.User.firstName,
            lastName: destinationAddress.User.lastName,
            numberAndStreet: destinationAddress.numberAndStreet,
            city: destinationAddress.city,
            zipCode: destinationAddress.zipCode,
            country: destinationAddress.country,
            phoneNumber: destinationAddress.User.phoneNumber,
            email: destinationAddress.User.email,
            relayId: order.relayId,
            instructions: order.shippingInstructions,
        }

        const newExpedition = await this.mondialRelayExpeditionService.createMondialRelayExpedition(expeditionInfos, destinationInfos, order);

        return newExpedition;
    }

}
