import { IsNotEmpty, IsString } from "class-validator";

export class EmployeeUserDto {
    @IsString()
    @IsNotEmpty()
    userId!: string;
    @IsString()
    @IsNotEmpty()
    fullName!: string;
    @IsString()
    @IsNotEmpty()
    email!: string;
}
