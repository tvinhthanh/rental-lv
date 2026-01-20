import { IsString, IsOptional } from 'class-validator';

export class UpdateTenantDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    subdomain?: string;

    @IsString()
    @IsOptional()
    customDomain?: string;

    @IsString()
    @IsOptional()
    subscriptionId?: string;
}
