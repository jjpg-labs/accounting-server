import { DecodedToken } from '../auth/auth.types';

declare module 'express' {
  interface Request {
    user?: DecodedToken;
  }
}
