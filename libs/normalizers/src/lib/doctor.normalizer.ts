import { HospitalDoctorGraphQLDto } from "@app/api-clients/hospital/dto/doctor.dto";
import { Gender, MedicalServicePrice } from "apps/tenant-management-service/src/domain";

export interface NormalizedDoctorDataDto {
    externalCode: string;
    name: string;
    gender?: Gender;
    avatarUrl?: string;
    experience?: string;
    announcement?: string;
    pinCode?: string;
    externalClinicCode: string; // makp
    services: {
        id: string; // mavp
        name: string; // tenvp
        prices: MedicalServicePrice;
        isHealthInsuranceApplied: boolean;
        rawData: Partial<HospitalDoctorGraphQLDto>;
    }[];
}