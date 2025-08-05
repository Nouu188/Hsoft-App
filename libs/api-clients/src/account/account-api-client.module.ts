import { Module } from "@nestjs/common";
import { AccountApiClientService } from "./account-api-client.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { AuthApiClientModule } from "../auth/auth-api-client.module";

@Module({
    imports:[
        HttpModule.register({
            timeout: 15000, 
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './libs/api-clients/.env.local',
        }),
        AuthApiClientModule
    ],
    providers: [AccountApiClientService,],
    exports: [AccountApiClientService],
})
export class AccountApiClientModule {}