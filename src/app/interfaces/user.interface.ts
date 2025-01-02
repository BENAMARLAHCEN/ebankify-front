export interface RegisterResponse {
    id: number;
    username: string;
    password: string;
    email: string;
    birthday: string;
    monthlyIncome: number;
    collateralAvailable: string;
    customerSince: string;
    role: Role;
    enabled: boolean;
    authorities: Authority[];
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    accountNonExpired: boolean;
}

export interface Role {
    id: number;
    name: string;
}

export interface Authority {
    authority: string;
}

export interface User {
    id?: number;
    username: string;
    email: string;
    birthday: Date;
    monthlyIncome: number;
    collateralAvailable: string;
    customerSince?: Date;
    role?: string;
}


export interface BankAccount {
    id?: number;
    accountNumber: string;
    balance: number;
    status: 'ACTIVE' | 'BLOCKED';
    userId: number;
}