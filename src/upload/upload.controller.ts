import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadAnyFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1000000 })
            ]
        })
    ) file: Multer.File) {
        await this.uploadService.uploadFile(file.originalname, file.buffer);
    }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImageFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1000000 }),
                new FileTypeValidator({ fileType: 'image' })
            ]
        })
    ) file: Multer.File) {
        await this.uploadService.uploadFile(file.originalname, file.buffer);
    }

    @Post('pdf')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPdfFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1000000 }),
                new FileTypeValidator({ fileType: 'pdf' })
            ]
        })
    ) file: Multer.File) {
        await this.uploadService.uploadFile(file.originalname, file.buffer);
    }

}
