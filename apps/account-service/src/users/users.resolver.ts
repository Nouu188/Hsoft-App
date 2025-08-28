import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '../../../../libs/auth/src/decorators/current-user.decorator';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { M2MJwtGuard } from '@app/auth/guards/m2m-jwt.guard';
import { UserPayload } from './dto/user.payload';


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

  @Query(() => User, { name: 'findAllUsers' })
  @UseGuards(M2MJwtGuard)
  findAllUser(): Promise<User[]> {
    return this.usersService.findAllUsers()
  }

  @Query(() => User, { name: 'findByPhoneNumber', nullable: true })
  @UseGuards(M2MJwtGuard)
  async findByPhoneNumber( 
    @Args('phoneNumber', { type: () => String }) phoneNumber: string,
  ): Promise<UserPayload | undefined> {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);

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
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User not found for userId: ${userId}`);
    }

    return user;
  }

  @Mutation(() => Boolean, { name: 'registerFcmToken' })
  @UseGuards(JwtAuthGuard)
  async registerFcmToken(
    @CurrentUser() user: User,
    @Args('fcm_token', { type: () => String }) fcm_token: string,
  ): Promise<boolean> {
    return this.usersService.addDeviceToken(user.id, fcm_token, 'FCM');
  }

  /**
   * Xoá nhiều FCM token theo userId
   * (dùng guard M2M để service khác trong hệ thống gọi)
   */
  @Mutation(() => Boolean, { name: 'removeFcmTokens' })
  @UseGuards(M2MJwtGuard)
  async removeFcmTokens(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('tokens', { type: () => [String] }) tokens: string[],
  ): Promise<boolean> {
    return this.usersService.removeDeviceTokens(userId, tokens);
  }
}
