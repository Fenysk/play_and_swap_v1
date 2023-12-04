import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    state: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    images: string[];
}
