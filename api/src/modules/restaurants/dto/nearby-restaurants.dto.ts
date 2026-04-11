import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional, IsString, ValidateIf } from 'class-validator';

export class NearbyRestaurantsDto {
    @IsOptional()
    @IsString()
    city?: string;

    @ValidateIf((o) => !o.city)
    @Type(() => Number)
    @IsLatitude()
    lat?: number;

    @ValidateIf((o) => !o.city)
    @Type(() => Number)
    @IsLongitude()
    lng?: number;
}
