import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { M2MJwtGuard } from '@app/auth/guards/m2m-jwt.guard';
import { DeviceToken, DeviceTokenInput, User } from 'apps/account-service/src/domain/users/entities';
import { CurrentUser } from '@app/auth';
import { UserPayload } from 'apps/account-service/src/domain/users/dtos';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllUsersQuery } from 'apps/account-service/src/application/queries/users/GetAllUsers.query';
import { GetUserByIdQuery } from 'apps/account-service/src/application/queries/users/GetUserById.query';
import { GetUserByPhoneNumberQuery } from 'apps/account-service/src/application/queries/users';
import { FcmTokenRegisterationCommand } from 'apps/account-service/src/application';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly querryBus: QueryBus,  
) { }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Query(() => User, { name: 'findAllUsers' })
  @UseGuards(M2MJwtGuard)
  findAllUser(): Promise<User[]> {
    return this.querryBus.execute(new GetAllUsersQuery());
  }

  @Query(() => User, { name: 'findByPhoneNumber', nullable: true })
  @UseGuards(M2MJwtGuard)
  async findByPhoneNumber( 
    @Args('phoneNumber', { type: () => String }) phoneNumber: string,
  ): Promise<UserPayload | undefined> {
    const user = await this.querryBus.execute(new GetUserByPhoneNumberQuery(phoneNumber));

    if (!user) {
      throw new NotFoundException(`User not found for phoneNumber: ${phoneNumber}`);
    }

    return user;
  }

  @Query(() => User, { name: 'findById', nullable: true })
  @UseGuards(M2MJwtGuard)
  async findById( 
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<UserPayload | undefined> {
    const user = await this.querryBus.execute(new GetUserByIdQuery(userId));

    if (!user) {
      throw new NotFoundException(`User not found for userId: ${userId}`);
    }

    return user;
  }

  @Mutation(() => Boolean, { name: 'registerFcmToken' })
  @UseGuards(JwtAuthGuard)
  async registerFcmToken(
    @CurrentUser() user: User,
    @Args('deviceToken', { type: () => DeviceTokenInput }) deviceToken: DeviceTokenInput,
  ): Promise<boolean> {
    return this.commandBus.execute(new FcmTokenRegisterationCommand(user.id, deviceToken))
  }
}