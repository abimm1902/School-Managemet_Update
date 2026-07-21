import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

/**
 * Must run AFTER JwtAuthGuard (which populates req.user).
 * Only lets the request through if the authenticated user's role is "admin".
 * This is what enforces "admin can only create teacher and student".
 */
@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== "admin") {
      throw new ForbiddenException("Only an admin can perform this action");
    }

    return true;
  }
}
