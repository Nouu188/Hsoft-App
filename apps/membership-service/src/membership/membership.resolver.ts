import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Membership } from './entities/membership.entity';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dtos/check-membership.dto';

@Resolver(() => Membership)
export class MembershipResolver {
  constructor(private readonly membershipService: MembershipService) {}

  @Query(() => [Membership])
  async membershipsByUser(@Args('userId') userId: string) {
    return this.membershipService.findByUser(userId);
  }

  @Mutation(() => Membership)
  async createMembership(@Args('input') input: CreateMembershipDto) {
    return this.membershipService.create(input);
  }

  @Query(() => Boolean)
  async checkMembership(
    @Args('userId') userId: string,
    @Args('tenantId') tenantId: string,
    @Args('role') role: string,
  ) {
    return this.membershipService.checkMembership(userId, tenantId, role);
  }
}
