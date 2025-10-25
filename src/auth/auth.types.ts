export type SignInParams = {
  email: string;
  password: string;
};

export type SignInResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
  };
};

export type DecodedToken = {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
};

export type AccessToken = string | undefined;
