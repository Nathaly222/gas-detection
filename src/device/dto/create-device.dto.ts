import { IsString } from "class-validator";

export class CreateDeviceDto {
    @IsString()
    name_device: string;

    @IsString()
    status: string;
}
