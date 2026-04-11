import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class NearbyRestaurantsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @ValidateIf((dto: NearbyRestaurantsDto) => !dto.city)
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @ValidateIf((dto: NearbyRestaurantsDto) => !dto.city)
  @Type(() => Number)
  @IsLongitude()
  lng?: number;
}
