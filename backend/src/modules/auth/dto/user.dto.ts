export class CustomerDTO {
    userId?: string;
    fullName?: string;
    email?: string;
    isVerified?: boolean;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: string;
    driverLicenseNo?: string;
    driverLicenseExpiry?: Date;
    nationalId?: string;
    nationality?: string;
    avatarUrl?: string;
}

export class EmployeeDTO {
    userId?: string;
    fullName?: string;
    email?: string;
    isVerified?: boolean;
    department?: string;
    position?: string;
    salary?: number;
    status?: string;
    hireDate?: Date;
    avatarUrl?: string;
    bio?: string;
    permissions?: string[];
    branchId?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: string;
    driverLicenseNo?: string;
    driverLicenseExpiry?: Date;
    nationalId?: string;
    nationality?: string;

}   