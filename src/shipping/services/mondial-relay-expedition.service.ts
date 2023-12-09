import { Injectable } from "@nestjs/common";
import { SoapService } from "./soap.service";
import { ConfigService } from "@nestjs/config";
import { OrdersService } from "src/orders/orders.service";
import { AddressesService } from "src/addresses/addresses.service";
import { Md5HashService } from "./md5-hash.service";
const crypto = require('crypto');

@Injectable()
export class MondialRelayExpeditionService {
    constructor(
        private readonly soapService: SoapService,
        private readonly configService: ConfigService,
        private readonly odersService: OrdersService,
        private readonly addressesService: AddressesService,
        private readonly md5HashService: Md5HashService
    ) { }

    async createMondialRelayExpedition(expeditionInfos: any, destinationInfos: any, order: any) {

        const API_URL = this.configService.get('MONDIAL_RELAY_API_URL');

        const envelope = {
            start: '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
            end: '</soap12:Envelope>'
        }

        const body = {
            start: '<soap12:Body>',
            end: '</soap12:Body>'
        }

        const action = {
            start: '<WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">',
            end: '</WSI2_CreationEtiquette>'
        }

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
            Exp_Valeur: order.amount,
            Exp_Devise: order.currency.toUpperCase(),
            COL_Rel_Pays: 'FR',
            COL_Rel: expeditionInfos.relayId,
            LIV_Rel_Pays: 'FR',
            LIV_Rel: destinationInfos.relayId,
            Instructions: destinationInfos.instructions || 'null',
            Texte: texte
        }

        for (const key in args) {
            if (typeof args[key] === 'string')
                args[key] = args[key].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, envelope, body, action, args);
        const newExpedition = this.getExpeditionInfos(response);

        const updatedOrder = await this.odersService.setShippingInfosToOrder(order.id, newExpedition);

        return updatedOrder;
    }

    getExpeditionInfos(objectResponse: any) {
        const expeditionInfos = [];

        const expeditionInfosList = objectResponse['soap:Envelope']['soap:Body'][0]['WSI2_CreationEtiquetteResponse'][0]['WSI2_CreationEtiquetteResult'];

        const startUrl = 'https://www.mondialrelay.fr';

        expeditionInfosList.forEach((expeditionInfo: any) => {
            const expedition = {
                expeditionNumber: expeditionInfo.ExpeditionNum[0],
                urlEtiquette: startUrl + expeditionInfo.URL_Etiquette[0].replace('&amp;', '&')
            };

            expeditionInfos.push(expedition);
        });

        return expeditionInfos[0]
    }

}

/*

<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
        <WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">
            <Enseigne>string</Enseigne>
            <ModeCol>string</ModeCol> REL pour Relay
            <ModeLiv>string</ModeLiv> 24R pour livraison en 24h relais
            <NDossier>string</NDossier> Numéro de dossier (orderId)
            <NClient>string</NClient> Numéro de client (userId)
            <Expe_Langage>string</Expe_Langage> FR pour français
            <Expe_Ad1>string</Expe_Ad1>
            <Expe_Ad2>string</Expe_Ad2>
            <Expe_Ad3>string</Expe_Ad3>
            <Expe_Ad4>string</Expe_Ad4>
            <Expe_Ville>string</Expe_Ville>
            <Expe_CP>string</Expe_CP>
            <Expe_Pays>string</Expe_Pays>
            <Expe_Tel1>string</Expe_Tel1>
            <Expe_Tel2>string</Expe_Tel2>
            <Expe_Mail>string</Expe_Mail>
            <Dest_Langage>string</Dest_Langage> FR pour français
            <Dest_Ad1>string</Dest_Ad1>
            <Dest_Ad2>string</Dest_Ad2>
            <Dest_Ad3>string</Dest_Ad3>
            <Dest_Ad4>string</Dest_Ad4>
            <Dest_Ville>string</Dest_Ville>
            <Dest_CP>string</Dest_CP>
            <Dest_Pays>string</Dest_Pays>
            <Dest_Tel1>string</Dest_Tel1>
            <Dest_Tel2>string</Dest_Tel2>
            <Dest_Mail>string</Dest_Mail>
            <Poids>decimal</Poids> 7 caractères dont 2 décimales optionnelles
            <NbColis>int</NbColis>
            <CRT_Valeur>decimal</CRT_Valeur> Contre remboursement que le destinataire doit payer au moment de la livraison.
            <CRT_Devise>string</CRT_Devise> EUR pour euro
            <Exp_Valeur>decimal</Exp_Valeur> Valeur de la marchandise
            <Exp_Devise>string</Exp_Devise> EUR pour euro
            <COL_Rel_Pays>string</COL_Rel_Pays> Pays du point relais de collecte (ISO)
            <COL_Rel>string</COL_Rel> Numéro du point relais de collecte
            <LIV_Rel_Pays>string</LIV_Rel_Pays> Pays du point relais de livraison (ISO)
            <LIV_Rel>string</LIV_Rel> Numéro du point relais de livraison
            <Instructions>string</Instructions> Instructions complémentaires de livraison
            <Security>string</Security> Hash de sécurité
            <Texte>string</Texte> Correspond aux articles qui composent l'expédition. 10 lignes max de 30 caractères max. Un article par ligne. Aucun caractère & " < > n'est autorisé. Chaque ligne se fini par "(cr)"
        </WSI2_CreationEtiquette>
    </soap12:Body>
</soap12:Envelope>

{
    Enseigne: ENSEIGNE,
    ModeCol: MODE DE COLLECTE (REL pour Relay),
    ModeLiv: MODE DE LIVRAISON (24R pour livraison en 24h relais),
    NDossier: NUMERO DE DOSSIER (orderId),
    NClient: NUMERO DE CLIENT (userId),
    Expe_Langage: LANGUE (FR pour français),
    Expe_Ad1: NOM et PRENOM,
    Expe_Ad2: complément (facultatif),
    Expe_Ad3: NUMERO et RUE,
    Expe_Ad4: complément (facultatif),
    Expe_Ville: VILLE,
    Expe_CP: CODE POSTAL,
    Expe_Pays: ISO PAYS,
    Expe_Tel1: NUMERO DE TELEPHONE,
    Expe_Tel2: facultatif,
    Expe_Mail: EMAIL,
    Dest_Langage: LANGUE (FR pour français),
    Dest_Ad1: NOM et PRENOM,
    Dest_Ad2: complément (facultatif),
    Dest_Ad3: NUMERO et RUE,
    Dest_Ad4: complément (facultatif),
    Dest_Ville: VILLE,
    Dest_CP: CODE POSTAL,
    Dest_Pays: ISO PAYS,
    Dest_Tel1: NUMERO DE TELEPHONE,
    Dest_Tel2: facultatif,
    Dest_Mail: EMAIL,
    Poids: POIDS (7 caractères dont 2 décimales optionnelles)
    NbColis: NOMBRE DE COLIS,
    CRT_Valeur: CONTRE REMBOURSEMENT (0 = pas de contre remboursement),
    CRT_Devise: DEVISE (EUR pour euro),
    Exp_Valeur: VALEUR DE LA MARCHANDISE (facultatif),
    Exp_Devise: DEVISE (EUR pour euro par défaut, facultatif),
    COL_Rel_Pays: PAYS DU POINT RELAIS DE COLLECTE (ISO, facultatif),
    COL_Rel: NUMERO DU POINT RELAIS DE COLLECTE (facultatif),
    LIV_Rel_Pays: PAYS DU POINT RELAIS DE LIVRAISON (ISO, facultatif),
    LIV_Rel: NUMERO DU POINT RELAIS DE LIVRAISON (facultatif),
    Instructions: INSTRUCTIONS COMPLEMENTAIRES DE LIVRAISON (facultatif),
    Security: HASH DE SECURITE,
    Texte: ARTICLES (1 par ligne, 10 lignes max, 30 caractères max par ligne, pas de caractères spéciaux, facultatif)

}

*/
