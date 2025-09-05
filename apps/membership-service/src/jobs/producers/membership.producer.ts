import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { MembershipHospital } from '../../membership/entities';

@Injectable()
export class MembershipProducer {
  private readonly logger = new Logger(MembershipProducer.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async emitCreated(membership: any) {
    this.logger.log(`Emit Membership Created: ${membership.id}`);
    await this.amqpConnection.publish(
      ExchangeName.USER_EVENTS,
      RoutingKey.USER_PROFILE_UPDATED,
      { type: 'MEMBERSHIP_CREATED', membership },
    );
  }

  async emitAssignedHospital(membershipHospital: any) {
    this.logger.log(
      `Emit Membership Assigned to Hospital: ${membershipHospital.id} (membershipId=${membershipHospital.membershipId}, hospitalId=${membershipHospital.hospitalId})`,
    );
    await this.amqpConnection.publish(
      ExchangeName.USER_EVENTS,
      RoutingKey.USER_PROFILE_UPDATED,
      { type: 'MEMBERSHIP_ASSIGNED_HOSPITAL', membershipHospital },
    );
  }

  async emitRoleChanged(membershipId: string, oldRole: string, newRole: string) {
    this.logger.log(
      `Emit Membership Role Changed: membershipId=${membershipId}, ${oldRole} -> ${newRole}`,
    );
    await this.amqpConnection.publish(
      ExchangeName.USER_EVENTS,
      RoutingKey.USER_PROFILE_UPDATED,
      {
        type: 'MEMBERSHIP_ROLE_CHANGED',
        membershipId,
        oldRole,
        newRole,
      },
    );
  }

  async emitRemoved(membershipId: string) {
    this.logger.log(`Emit Membership Removed: membershipId=${membershipId}`);
    await this.amqpConnection.publish(
      ExchangeName.USER_EVENTS,
      RoutingKey.USER_PROFILE_UPDATED,
      {
        type: 'MEMBERSHIP_REMOVED',
        membershipId,
      },
    );
  }

  async emitBulkAssignedHospital(
    membershipHospitals: MembershipHospital[],
    bulkId: string = Date.now().toString(),
  ) {
    this.logger.log(
      `Emit Bulk Membership Assigned to Hospitals: count=${membershipHospitals.length}, bulkId=${bulkId}`,
    );
    await this.amqpConnection.publish(
      ExchangeName.USER_EVENTS,
      RoutingKey.USER_PROFILE_UPDATED,
      {
        type: 'MEMBERSHIP_BULK_ASSIGNED_HOSPITAL',
        bulkId,
        membershipHospitals,
      },
    );
  }
}
