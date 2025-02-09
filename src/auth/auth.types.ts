export type SignInParams = {
	email: string,
	pass: string
};

export type SignInResponse = {
	message?: string,
	access_token?: string
};

export type AuthToken = string | undefined;