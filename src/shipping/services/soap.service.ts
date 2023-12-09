import { Injectable } from "@nestjs/common";
import { parseString } from 'xml2js';

@Injectable()
export class SoapService {

    async postSoapRequest(API_URL: string, envelope: any, body: any, action: any, args: any) {

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

        parseString(xml, (err: any, result: any) => {
            object = result;
        });

        return object;
    }

}
