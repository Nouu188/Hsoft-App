import { Role } from "../enums/role.enum";

export interface AuthPayload { 
    sub: string; 
    roles?: Role[]; 
    scopes?: string[];
}