import { LoginResponse } from '../../../dto/login/login.response';
import { RequestOtpResponse } from '../../../dto/request-otp-response.dto';

export interface IRegistrationStrategy<TInitiateInput, TCompleteInput> {
  initiate(input: TInitiateInput): Promise<RequestOtpResponse>;
  complete(input: TCompleteInput): Promise<LoginResponse>;
}