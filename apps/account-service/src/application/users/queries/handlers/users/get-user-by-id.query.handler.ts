import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "../../impl/users/get-user-by-id.query";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { User } from "apps/account-service/src/domain/users/entities";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, User | null> {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    ) { }

    async execute(query: GetUserByIdQuery) {
        const { id } = query;
        if(!id) {
            throw new UnauthorizedException('User ID is required');
        }
        return this.userRepository.findById(id);
    }
}