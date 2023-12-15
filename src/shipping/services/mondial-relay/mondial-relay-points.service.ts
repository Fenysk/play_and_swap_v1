import { Injectable } from "@nestjs/common";
import { SoapService } from "../soap.service";
import { ConfigService } from "@nestjs/config";
import { Md5HashService } from "../md5-hash.service";
const crypto = require('crypto');

@Injectable()
export class MondialRelayPointsService {
    constructor(
        private readonly soapService: SoapService,
        private readonly configService: ConfigService,
        private readonly md5HashService: Md5HashService,
    ) { }

    async getMondialRelayPointsArroundMe(address: any) {

        const API_URL = this.configService.get('MONDIAL_RELAY_API_URL');

        const actionName = 'WSI4_PointRelais_Recherche'

        const args = {
            Enseigne: this.configService.get('MONDIAL_RELAY_ENSEIGNE'),
            Pays: address.country,
            Ville: address.city.replace(/-/g, ' '),
            CP: address.zipCode
        };
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, actionName, args);
        const relayPoints = this.getRelayPointsInfos(response);

        return relayPoints;
    }

    getRelayPointsInfos(objectResponse: any) {

        const relayPointsList = objectResponse.PointsRelais.PointRelais_Details;

        const relayPoints = [];

        relayPointsList.forEach((relayPoint: any) => {
            const relay = {
                id: relayPoint.Num,
                name: relayPoint.LgAdr1,
                address: relayPoint.LgAdr3,
                zipCode: relayPoint.CP,
                city: relayPoint.Ville,
                country: relayPoint.Pays,
                latitude: relayPoint.Latitude,
                longitude: relayPoint.Longitude
            };

            relayPoints.push(relay);
        });

        return relayPoints;
    }

    async checkIfRelayPointExists(relayId: string) {
        const API_URL = this.configService.get('MONDIAL_RELAY_API_URL');

        const actionName = 'WSI2_DetailPointRelais'

        const args = {
            Enseigne: this.configService.get('MONDIAL_RELAY_ENSEIGNE'),
            Num: relayId,
            Pays: 'FR',
        };
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, actionName, args);

        return response.STAT === '0';
    }

}
