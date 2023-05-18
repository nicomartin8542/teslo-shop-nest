import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetRawHeader = createParamDecorator(
  (data: string, ctx: ExecutionContext): string[] => {
    const req = ctx.switchToHttp().getRequest();
    const rawheader = req.rawHeaders;

    if (!rawheader)
      throw new InternalServerErrorException(
        'Row headers not founds (Request)',
      );

    return rawheader;
  },
);
