import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../../auth/auth.guard';
import { jwtConstants } from '../../auth/constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = new JwtService({ secret: jwtConstants.secret });
    reflector = new Reflector();
    authGuard = new AuthGuard(jwtService, reflector);
  });

  it('should return true if the route is public', async () => {
    const context = createMockExecutionContext(true);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = await authGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const context = createMockExecutionContext(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true and set request.user if token is valid', async () => {
    const context = createMockExecutionContext(false, 'Bearer validToken');
    const mockPayload = { userId: 1 };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

    const result = await authGuard.canActivate(context);
    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest()).toHaveProperty('user');
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const context = createMockExecutionContext(false, 'Bearer invalidToken');
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
      throw new Error();
    });

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  function createMockExecutionContext(
    isPublic: boolean,
    authorizationHeader?: string,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authorizationHeader,
          },
          user: undefined,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }
});
