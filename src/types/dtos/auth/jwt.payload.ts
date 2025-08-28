export interface JwtPayload {
  sub: string;
  identifier: string;
  roles: string[];
  iat: number;
  exp: number;
}
