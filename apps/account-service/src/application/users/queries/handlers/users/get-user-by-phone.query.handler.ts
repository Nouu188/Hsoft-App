import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByPhoneNumberQuery } from "../../impl/users";
import { User } from "apps/account-service/src/domain/users/entities";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { Inject } from "@nestjs/common";

@QueryHandler(GetUserByPhoneNumberQuery)
export class GetUserByPhoneHandler  implements IQueryHandler<GetUserByPhoneNumberQuery, User | null> {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    ) { }

    async execute(query: GetUserByPhoneNumberQuery) {
        const { phoneNumber } = query;
        return this.userRepository.findByPhoneNumber(phoneNumber);
    }
}