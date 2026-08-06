import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

/**
 * Milestone 2 slice: just `GET /me`, enough to prove the auth guard and
 * session decorator work end-to-end. Profile update, addresses, orders,
 * and wishlist tabs (per the architecture doc's account.html mapping)
 * land with their own modules in later milestones.
 */
@Controller('users')
export class UsersController {
  @Get('me')
  me(@Session() session: UserSession) {
    return { user: session.user };
  }
}
