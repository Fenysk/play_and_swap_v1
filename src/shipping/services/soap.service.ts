import { Injectable } from "@nestjs/common";
import { parseString } from 'xml2js';
import { API_ERRORS_MESSAGE } from "./mondial-relay/api-error-message";

@Injectable()
export class SoapService {

    async postSoapRequest(API_URL: string, actionName: string, args: any) {

        const action = {
            start: `<${actionName} xmlns="http://www.mondialrelay.fr/webservice/">`,
            end: `</${actionName}>`
        }

        const envelope = {
            start: '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
            end: '</soap12:Envelope>'
        }

        const body = {
            start: '<soap12:Body>',
            end: '</soap12:Body>'
        }

        console.log(args);
        const xmlData = this.transformObjectToXml(args);
        console.log(xmlData);

        const bodyContent = `${envelope.start}${body.start}${action.start}${xmlData}${action.end}${body.end}${envelope.end}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
            },
            body: bodyContent
        });

        const text = await response.text();

        console.log(text);

        const data = this.transformXmlToObject(text);
        return data;
    }

    transformObjectToXml(object: any) {
        let xml = '';

        for (const key in object)
            xml += `<${key}>${object[key]}</${key}>`;

        return xml;
    }

    transformXmlToObject(xml: string) {
        let object: any = {};

        const options = {
            explicitArray: false,
            ignoreAttrs: true
        };

        parseString(xml, options, (err: any, result: any) => {
            if (err) throw new Error(err);

            object = result;
        });

        const action = Object.keys(object['soap:Envelope']['soap:Body'])[0].replace('Response', '');
        const objectResponse = object['soap:Envelope']['soap:Body'][`${action}Response`][`${action}Result`];

        const apiErrorsMessages = API_ERRORS_MESSAGE;
        if (objectResponse.STAT !== '0')
            throw new Error('Error ' + objectResponse.STAT + ' : ' + apiErrorsMessages[objectResponse.STAT]);

        return objectResponse;
    }

}
