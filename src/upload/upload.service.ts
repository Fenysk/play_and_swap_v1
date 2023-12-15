import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
    private readonly s3Client = new S3Client({
        region: this.configService.getOrThrow('AWS_S3_REGION'),

    })
    constructor(private readonly configService: ConfigService) { }

    async uploadFile(fileName: string, fileContent: Buffer) {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
                Key: fileName,
                Body: fileContent,
            })
        );

        return 'File uploaded successfully';
    }

}
