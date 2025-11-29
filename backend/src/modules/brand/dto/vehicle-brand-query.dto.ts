import { IsOptional, IsString } from 'class-validator';

export class VehicleBrandQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  page?: number;
  limit?: number;
}
