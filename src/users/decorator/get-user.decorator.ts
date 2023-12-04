import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (
        data: string | undefined,
        context: ExecutionContext
    ) => {
        const request: Express.Request & { user: any } = context
            .switchToHttp()
            .getRequest();

        if (!data)
            return request.user;

        return request.user[data];
    }
)
