import AxiosFactory from "../../../../axios/AxiosFactory";
import apiIndex from "../apis";
import BaseInstance from "../instance";

export interface LoginCredentials {
    email?: string;
    password: string;
    phone?: number;
}

enum RoleIndex {
    ADMIN = "ADMIN",
    EMPLOYEE = "EMPLOYEE",
    UNKNOWN = "UNKNOWN"
}

export interface LoginData {
    loginData: {
        success: boolean;
        userId: string;
        role?: RoleIndex;
        name: string;
        email?: string;
        phone?: number;
    }
}

export default async function login(data:LoginCredentials){
    const res=AxiosFactory.createInstance().post(apiIndex.login, data);
    return res;
}