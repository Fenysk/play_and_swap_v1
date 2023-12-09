import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const crypto = require('crypto');

@Injectable()
export class Md5HashService {
    constructor(private readonly configService: ConfigService) { }

    getSecurityHash(args: any) {
        const MONDIAL_RELAY_SECRET_KEY = this.configService.get('MONDIAL_RELAY_SECRET_KEY');

        let data = '';

        console.log(args);

        for (const key in args) {
            if (key !== 'Texte') {
                data += args[key];
                console.log(key + ' : ' + args[key]);
            }
        }

        data += MONDIAL_RELAY_SECRET_KEY;

        console.log(data);

        const hash = crypto.createHash('md5').update(data).digest('hex').toUpperCase();

        console.log(hash);

        return hash;
    }

}
