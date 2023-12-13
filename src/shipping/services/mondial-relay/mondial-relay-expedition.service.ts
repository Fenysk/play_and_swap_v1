import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { SoapService } from "../soap.service";
import { ConfigService } from "@nestjs/config";
import { OrdersService } from "src/orders/orders.service";
import { Md5HashService } from "../md5-hash.service";
import { API_SUCCESS_MESSAGE } from "./api-success-message";
const crypto = require('crypto');

@Injectable()
export class MondialRelayExpeditionService {
    constructor(
        private readonly soapService: SoapService,
        private readonly configService: ConfigService,
        private readonly md5HashService: Md5HashService,

        @Inject(forwardRef(() => OrdersService)) private readonly odersService: OrdersService,
    ) { }

    async createMondialRelayExpedition(expeditionInfos: any, destinationInfos: any, order: any) {

        const API_URL = this.configService.get('MONDIAL_RELAY_API_URL');

        const actionName = 'WSI2_CreationEtiquette';

        let texte = '';
        order.Cart.CartItem.forEach((cartItem: any) => {
            texte += 'Jeu-vidéo ' + cartItem.Item.name + '(cr)';
        });

        const args = {
            Enseigne: this.configService.get('MONDIAL_RELAY_ENSEIGNE'),
            ModeCol: 'REL',
            ModeLiv: '24R',
            NDossier: '15max',
            NClient: '9max',

            Expe_Langage: 'FR',
            Expe_Ad1: expeditionInfos.lastName + ' ' + expeditionInfos.firstName,
            Expe_Ad3: expeditionInfos.numberAndStreet,
            Expe_Ville: expeditionInfos.city,
            Expe_CP: expeditionInfos.zipCode,
            Expe_Pays: expeditionInfos.country,
            Expe_Tel1: expeditionInfos.phoneNumber,
            Expe_Mail: expeditionInfos.email,

            Dest_Langage: 'FR',
            Dest_Ad1: destinationInfos.firstName + ' ' + destinationInfos.lastName,
            Dest_Ad3: destinationInfos.numberAndStreet,
            Dest_Ville: destinationInfos.city,
            Dest_CP: destinationInfos.zipCode,
            Dest_Pays: destinationInfos.country,
            Dest_Tel1: destinationInfos.phoneNumber,
            Dest_Mail: destinationInfos.email,

            Poids: 150,
            NbColis: 1,
            CRT_Valeur: 0,
            CRT_Devise: order.currency.toUpperCase(),
            Exp_Valeur: order.cartAmount,
            Exp_Devise: order.currency.toUpperCase(),
            COL_Rel_Pays: 'FR',
            COL_Rel: expeditionInfos.relayId,
            LIV_Rel_Pays: 'FR',
            LIV_Rel: destinationInfos.relayId,
            Instructions: destinationInfos.instructions || 'null',
            Texte: texte
        }
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, actionName, args);
        const newExpedition = this.getNewExpeditionInfosObject(response);

        const updatedOrder = await this.odersService.setShippingInfosToOrder(order.id, newExpedition);

        return updatedOrder;
    }

    getNewExpeditionInfosObject(objectResponse: any) {
        const startUrl = 'https://www.mondialrelay.fr';

        const expeditionInfos = {
            expeditionNumber: objectResponse.ExpeditionNum,
            urlEtiquette: startUrl + objectResponse.URL_Etiquette.replace('&amp;', '&')
        };

        return expeditionInfos;
    }

    async checkMondialRelayExpedition(expeditionNumber: string) {
        const API_URL = this.configService.get('MONDIAL_RELAY_API_URL');

        const actionName = 'WSI2_TracingColisDetaille';

        const args = {
            Enseigne: this.configService.get('MONDIAL_RELAY_ENSEIGNE'),
            Expedition: expeditionNumber,
            Langue: 'FR'
        }
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, actionName, args);
        const expeditionInfos = this.getExpeditionInfosObject(response);

        return expeditionInfos;
    }

    getExpeditionInfosObject(objectResponse: any) {

        const expeditionInfos = {
            STAT: objectResponse.STAT,
            message: API_SUCCESS_MESSAGE[objectResponse.STAT],
            destinationRelayId: objectResponse.Relais_Num
        }

        return expeditionInfos;
    }

}
