import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { User } from "apps/account-service/src/domain/users/entities";
import { IUserRepository } from "apps/account-service/src/domain/users/interfaces";
import { GetAllUsersQuery } from "../GetAllUsers.query";

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery, User[]> {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    ) { }

    async execute() {
        return this.userRepository.findAll();
    }
}