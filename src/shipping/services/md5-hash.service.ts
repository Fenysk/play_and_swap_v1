import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const crypto = require('crypto');

@Injectable()
export class Md5HashService {
    constructor(private readonly configService: ConfigService) { }

    getSecurityHash(args: any) {

        for (const key in args) {
            if (typeof args[key] === 'string')
                args[key] = args[key].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        const MONDIAL_RELAY_SECRET_KEY = this.configService.get('MONDIAL_RELAY_SECRET_KEY');

        let data = '';

        for (const key in args)
            if (key !== 'Texte')
                data += args[key]

        data += MONDIAL_RELAY_SECRET_KEY;

        const hash = crypto.createHash('md5').update(data).digest('hex').toUpperCase();

        console.log(hash);

        return hash;
    }

}
