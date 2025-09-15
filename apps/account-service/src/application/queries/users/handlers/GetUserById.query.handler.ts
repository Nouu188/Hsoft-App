import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { User } from "apps/account-service/src/domain/users/entities";
import { GetUserByIdQuery } from "../GetUserById.query";

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