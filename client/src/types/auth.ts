export interface LoginRequest {
    username:string;
    password:string;
}

export interface RegisterRequest {
    username:string;
    password:string;
}

export interface User {
    id:number;
    username:string;
    role:"USER" | "ADMIN";
}