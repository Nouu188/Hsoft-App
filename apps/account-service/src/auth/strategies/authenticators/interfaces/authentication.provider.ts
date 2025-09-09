import { UserPayload } from "apps/account-service/src/users/dto/user.payload";

export interface ILoginStrategy<TInput> {
  authenticate(input: TInput): Promise<UserPayload>;
}