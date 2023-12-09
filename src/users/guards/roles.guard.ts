import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "../entities";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass()
        ]);

        if (!requiredRoles)
            return true;

        const { user } = context.switchToHttp().getRequest();

        const hasRoles = requiredRoles.some((role) => user.roles?.includes(role));

        if (!hasRoles)
            throw new ForbiddenException('Vous n\'avez pas les droits requis pour effectuer cette action');

        return true;
    }
}
