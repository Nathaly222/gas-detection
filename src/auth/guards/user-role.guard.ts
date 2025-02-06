import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../dto/decorators/role-protected-decorator';
import { ValidRoles } from '../enums/valid-roles.enum';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles: ValidRoles[] = this.reflector.get<ValidRoles[]>(META_ROLES, context.getHandler());
    if (!validRoles || validRoles.length === 0) return true;
  
    const request = context.switchToHttp().getRequest();
    const user = request.user;
  
    console.log('User:', user);  
    
    if (!user || !user.role) {
      throw new ForbiddenException('User does not have roles assigned');
    }
  
    const hasRole = validRoles.includes(user.role);  
    if (!hasRole) {
      throw new ForbiddenException(`User requires one of the following roles: ${validRoles.join(', ')}`);
    }
  
    return true;
  }
}
