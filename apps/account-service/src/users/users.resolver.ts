import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '../../../../libs/auth/src/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
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

  @Query(() => User, { name: 'findByIdentifier' })
  @UseGuards(M2MJwtGuard)
  findByIdentifier(
    @Args('identifier', { type: () => String }) identifier: string,
  ): Promise<User | undefined> {
    return this.usersService.findByIdentifier(identifier)
  }

  @Mutation(() => Boolean)
  async registerFcmToken(
    @Args('user_id', { type: () => String }) user_id: string,
    @Args('token', { type: () => String }) token: string,
  ): Promise<boolean> {
    return this.usersService.addFcmToken(user_id, token);
  }
}
