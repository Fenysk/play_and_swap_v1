import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
    private readonly s3Client = new S3Client({ region: this.configService.getOrThrow('AWS_S3_REGION') })
    constructor(private readonly configService: ConfigService) { }

    async getFileUrl(fileName: string) {
        const command = new GetObjectCommand({
            Bucket: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
            Key: fileName,
        });

        const url = await getSignedUrl(this.s3Client, command);

        return url;
    }

    async uploadFile(fileName: string, fileContent: Buffer) {
        const response = await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
                Key: fileName,
                Body: fileContent,
            })
        );

        return response;
    }

    async deleteFile(fileName: string) {
        const response = await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
                Key: fileName,
            })
        );

        return response;
    }

    async uploadFileFromUrl(fileName: string, fileUrl: string) {
        try {
            const fileResponse = await fetch(fileUrl);

            if (!fileResponse.ok) {
                throw new NotFoundException('Failed to fetch the file');
            }

            const fileContent = await fileResponse.arrayBuffer();
            const fileType = fileResponse.headers.get('content-type') || 'unknown';
            const fileExtension = fileType.split('/')[1];
            const fileNameWithExtension = `${fileName}.${fileExtension}`;

            const response = await this.uploadFile(fileNameWithExtension, Buffer.from(fileContent));

            return response;
        } catch (error) {
            throw new Error('Failed to upload the file');
        }
    }


}
