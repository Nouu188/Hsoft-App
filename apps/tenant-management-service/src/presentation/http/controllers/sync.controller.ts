import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Logger,
    Post
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SyncClinicsFromHospitalCommand, SyncDoctorsFromHospitalCommand } from "apps/tenant-management-service/src/application";

@Controller("sync")
export class SyncController {
    private readonly logger = new Logger(SyncController.name);

    constructor(private readonly commandBus: CommandBus) { }

    @Post("doctors")
    async syncDoctors(
        @Body("hospitalCode") hospitalCode: string,
        @Body("date") date: string,
    ) {
        this.logger.log(`Received request to sync doctors for hospitalCode=${hospitalCode}, date=${date}`);

        if (!date) {
            this.logger.warn(`Sync request rejected: missing date param for hospitalCode=${hospitalCode}`);
            throw new HttpException("Date is required", HttpStatus.BAD_REQUEST);
        }

        try {
            const command = new SyncDoctorsFromHospitalCommand(hospitalCode, date);
            this.logger.debug(`Dispatching SyncDoctorsFromHospitalCommand: ${JSON.stringify(command)}`);

            const result = await this.commandBus.execute(command);

            this.logger.log(
                `Sync completed for hospitalCode=${hospitalCode}. ` +
                `Doctors synced=${result.syncedDoctors}, Services synced=${result.syncedServices}`
            );

            return {
                success: true,
                message: "Doctor synchronization completed successfully",
                hospitalCode,
                date,
                result,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error while syncing doctors for hospitalCode=${hospitalCode}, date=${date}: ${error.message}`,
                error.stack,
            );
            throw new HttpException(
                {
                    success: false,
                    message: "Doctor synchronization failed",
                    error: error.message,
                    hospitalCode,
                    date,
                    timestamp: new Date().toISOString(),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post("clinics")
    // @Roles(Role.ADMIN) // Chỉ định quyền ADMIN cho endpoint này
    async syncClinics(
        @Body("hospitalCode") hospitalCode: string,
    ) {
        this.logger.log(`Received request to sync clinics for hospitalCode=${hospitalCode}`);

        if (!hospitalCode) {
            this.logger.warn(`Sync clinics request rejected: missing hospitalCode param`);
            throw new HttpException("hospitalCode is required", HttpStatus.BAD_REQUEST);
        }

        try {
            const command = new SyncClinicsFromHospitalCommand(hospitalCode);
            this.logger.debug(`Dispatching SyncClinicsFromHospitalCommand: ${JSON.stringify(command)}`);

            const result = await this.commandBus.execute(command);

            this.logger.log(
                `Sync completed for hospitalCode=${hospitalCode}. ` +
                `Clinics synced=${result.syncedCount}`
            );

            return {
                success: true,
                message: "Clinic synchronization completed successfully",
                hospitalCode,
                result,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error while syncing clinics for hospitalCode=${hospitalCode}: ${error.message}`,
                error.stack,
            );
            throw new HttpException(
                {
                    success: false,
                    message: "Clinic synchronization failed",
                    error: error.message,
                    hospitalCode,
                    timestamp: new Date().toISOString(),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
