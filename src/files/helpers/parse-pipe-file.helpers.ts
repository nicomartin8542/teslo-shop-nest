import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export const parseFilePipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: new RegExp(/(plain|txt|csv|pdf|jpeg|png)/i),
  })
  .addMaxSizeValidator({
    maxSize: 3000000, // = bytes -> 3mb
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });
