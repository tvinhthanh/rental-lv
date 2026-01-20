import { IsString, IsOptional } from 'class-validator';

export class CreateTenantDto {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    subdomain?: string;

    @IsString()
    @IsOptional()
    customDomain?: string;

    @IsString()
    subscriptionId!: string;
}
