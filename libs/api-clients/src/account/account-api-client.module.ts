import { Module } from "@nestjs/common";
import { AccountApiClientService } from "./account-api-client.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports:[
        HttpModule.register({
            timeout: 15000, 
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: './libs/api-clients/.env.local',
        }),
        
    ],
    providers: [AccountApiClientService,],
    exports: [AccountApiClientService],
})
export class AccountApiClientModule {}