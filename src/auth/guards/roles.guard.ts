import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "src/users/enums/user-role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('[RolesGuard] Required roles:', requiredRoles);

console.log('[RolesGuard] Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('[RolesGuard] User from request:', user);

    if (!user) {
    console.error('No user on request - check JWT strategy');

      throw new ForbiddenException('User not found on request');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Role '${user.role}' does not have access`);
    }
console.log('User role:', user.role);

    return true;
  }
}
