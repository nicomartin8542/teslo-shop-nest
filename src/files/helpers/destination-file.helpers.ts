import { BadRequestException } from '@nestjs/common';

export const destinationFile = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (err: Error, destination: string) => any,
) => {
  if (!file) callback(new BadRequestException('File not valid'), null);
  const destination = './static/products';

  return callback(null, destination);
};
