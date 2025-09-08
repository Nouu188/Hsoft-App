import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { UserRegistrationSaga, UserRegistrationSagaStatus } from '../entities/user-registration-saga.entity';

export interface StepDef {
  step: UserRegistrationSagaStatus;
  command: {
    type: string;
    routingKey: string;
    payloadMapper: (saga: UserRegistrationSaga, triggerPayload?: any) => Record<string, any>;
  };
  expectedSuccessEvent: string;
  expectedFailureEvent: string;
  onSuccess: UserRegistrationSagaStatus;
}

export const UserRegistrationWorkflow: StepDef[] = [
  {
    step: UserRegistrationSagaStatus.STARTED,
    command: {
      type: 'CREATE_IDENTITY_COMMAND',
      routingKey: RoutingKey.CREATE_IDENTITY_COMMAND,
      payloadMapper: (saga) => ({
        userId: saga.userId,
        identity: saga.context.initialEvent.identity,
        externalHospitalCode: saga.context.initialEvent.externalHospitalCode,
      }),
    },
    expectedSuccessEvent: RoutingKey.IDENTITY_CREATED_SUCCESS,
    expectedFailureEvent: RoutingKey.IDENTITY_CREATED_FAILURE,
    onSuccess: UserRegistrationSagaStatus.AWAITING_DOSE_SYNC, 
  },
  {
    step: UserRegistrationSagaStatus.AWAITING_DOSE_SYNC,
    command: {
      type: 'SYNC_DOSE_HISTORY_COMMAND',
      routingKey: RoutingKey.SYNC_DOSE_HISTORY_COMMAND,
      payloadMapper: (saga) => ({
        userId: saga.userId,
        hospitalUrl: saga.context.initialEvent.hospitalUrl,
      }),
    },
    expectedSuccessEvent: RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
    expectedFailureEvent: RoutingKey.DOSE_HISTORY_SYNCED_FAILURE,
    onSuccess: UserRegistrationSagaStatus.COMPLETED, 
  },
];