import { AuthPayload } from '@app/auth';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { GenerateM2mTokenCommand} from '../GenerateM2mToken.command';

@CommandHandler(GenerateM2mTokenCommand)
export class GenerateM2mTokenHandler implements ICommandHandler<GenerateM2mTokenCommand, { accessToken: string }> {
    private readonly logger = new Logger(GenerateM2mTokenHandler.name);

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: GenerateM2mTokenCommand): Promise<{ accessToken: string }> {
        const { clientId, scopes } = command.input;

        const payload: AuthPayload = {
            sub: clientId,
            scopes: scopes,
        };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        this.logger.debug(`Generated M2M token for clientId: ${clientId}`);
        return { accessToken };
    }
}
