import { Injectable } from "@nestjs/common";
import { SoapService } from "./soap.service";
import { ConfigService } from "@nestjs/config";
import { Md5HashService } from "./md5-hash.service";
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

        const envelope = { // Cela correspond à l'entête de la requête SOAP. Elle permet de définir le type de requête et les namespaces utilisés.
            start: '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
            end: '</soap12:Envelope>'
        }

        const body = { // Cela correspond au corps de la requête SOAP.
            start: '<soap12:Body>',
            end: '</soap12:Body>'
        }

        const action = { // Cela correspond à l'action à effectuer. Il permet de définir l'action à effectuer et les paramètres de la requête.
            start: '<WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">',
            end: '</WSI4_PointRelais_Recherche>'
        }

        const args = {
            Enseigne: this.configService.get('MONDIAL_RELAY_ENSEIGNE'),
            Pays: address.country,
            CP: address.zipCode,
        };
        args['Security'] = this.md5HashService.getSecurityHash(args)

        const response = await this.soapService.postSoapRequest(API_URL, envelope, body, action, args);
        const relayPoints = this.getRelayPoints(response);

        return relayPoints;
    }

    getRelayPoints(objectResponse: any) {
        const relayPoints = [];

        const relayPointsList = objectResponse['soap:Envelope']['soap:Body'][0]['WSI4_PointRelais_RechercheResponse'][0]['WSI4_PointRelais_RechercheResult'][0]['PointsRelais'][0]['PointRelais_Details'];

        relayPointsList.forEach((relayPoint: any) => {
            const relay = {
                id: relayPoint.Num[0],
                name: relayPoint.LgAdr1[0],
                address: relayPoint.LgAdr3[0],
                zipCode: relayPoint.CP[0],
                city: relayPoint.Ville[0],
                country: relayPoint.Pays[0],
                latitude: relayPoint.Latitude[0],
                longitude: relayPoint.Longitude[0]
            };

            relayPoints.push(relay);
        });

        return relayPoints;
    }

}
