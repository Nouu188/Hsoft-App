import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '../../../../libs/auth/src/decorators/current-user.decorator';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { M2MJwtGuard } from '@app/auth/guards/m2m-jwt.guard';


@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Query(() => User, { name: 'findAllUser' })
  @UseGuards(M2MJwtGuard)
  findAllUser(): Promise<User[]> {
    return this.usersService.findAllUser()
  }

  @Query(() => User, { name: 'findByIdentifier', nullable: true })
  @UseGuards(M2MJwtGuard)
  async findByIdentifier(
    @Args('identifier', { type: () => String }) identifier: string,
  ): Promise<User | undefined> {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new NotFoundException(`User not found for identifier: ${identifier}`);
    }

    return user;
  }

  @Mutation(() => Boolean, { name: 'registerFcmToken' })
  @UseGuards(JwtAuthGuard)
  async registerFcmToken(
    @CurrentUser() user: User,
    @Args('fcm_token', { type: () => String }) fcm_token: string,
  ): Promise<boolean> {
    return this.usersService.addFcmToken(user.id, fcm_token);
  }

  @Mutation(() => Boolean)
  @UseGuards(M2MJwtGuard) 
  async removeFcmTokens(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('tokens', { type: () => [String] }) tokens: string[],
  ): Promise<boolean> {
    return this.usersService.removeFcmTokens(userId, tokens);
  }
}
