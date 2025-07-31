import { Module } from "@nestjs/common";
import { DoseApiClientService } from "./dose-api-client.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        HttpModule.register({
            timeout: 15000, 
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './libs/api-clients/.env.local',
        }),
    ],
    providers: [
        DoseApiClientService
    ],
    exports: [
        DoseApiClientService
    ]
})
export class DoseApiClientModule {}