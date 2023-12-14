import { ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { AddressesService } from 'src/addresses/addresses.service';
import { MondialRelayPointsService } from './services/mondial-relay/mondial-relay-points.service';
import { MondialRelayExpeditionService } from './services/mondial-relay/mondial-relay-expedition.service';
import { OrdersService } from 'src/orders/orders.service';
import { PaymentStatus, ShippingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShippingService {

    constructor(
        private readonly addressesService: AddressesService,
        private readonly mondialRelayPointsService: MondialRelayPointsService,
        private readonly mondialRelayExpeditionService: MondialRelayExpeditionService,
        private readonly prismaService: PrismaService,

        @Inject(forwardRef(() => OrdersService)) private readonly ordersService: OrdersService,
    ) { }

    async checkIfRelayPointExists(relayId: string) {
        const relayPoints = await this.mondialRelayPointsService.checkIfRelayPointExists(relayId);

        return relayPoints;
    }

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
        if (order.Payment.status === PaymentStatus.EXPIRED)
            throw new ForbiddenException('Payment is expired, please retry');

        if (order.Payment.status === PaymentStatus.INITIATED || order.Payment.status === PaymentStatus.OPEN)
            throw new ForbiddenException('Payment is not done, please finish it');

        const notValidStatus: ShippingStatus[] = [ShippingStatus.IN_SHIPMENT, ShippingStatus.SHIPPED, ShippingStatus.DELIVERED, ShippingStatus.RETRIEVED, ShippingStatus.CANCELLED];
        if (notValidStatus.includes(order.Shipping.status as ShippingStatus))
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
            relayId: order.Shipping.relayId,
            instructions: order.Shipping.instructions,
        }

        const newExpedition = await this.mondialRelayExpeditionService.createMondialRelayExpedition(expeditionInfos, destinationInfos, order);

        await this.checkAndUpdateShippingStatus(orderId);

        return newExpedition;
    }

    async checkRelayExpedition(expeditionNumber: string) {
        const expeditionDetails = await this.mondialRelayExpeditionService.checkMondialRelayExpedition(expeditionNumber);

        return expeditionDetails;
    }

    async checkAndUpdateShippingStatus(orderId: string): Promise<any> {
        const order = await this.ordersService.getOrderByIdWithDetails(orderId);

        const expedition = await this.checkRelayExpedition(order.Shipping.expeditionNumber);

        if (order.Shipping.status === ShippingStatus.RETRIEVED)
            return order.Shipping;

        // TODO : Revoir les status
        const statusIndex = {
            '24': ShippingStatus.INITIATED,
            '80': ShippingStatus.IN_SHIPMENT,
            '81': ShippingStatus.SHIPPED,
            '82': ShippingStatus.DELIVERED,
            '83': ShippingStatus.CANCELLED,
        }

        const updatedShipping = await this.prismaService.shipping.update({
            where: { id: order.Shipping.id },
            data: { status: statusIndex[expedition.STAT], }
        });

        return updatedShipping;
    }

}
