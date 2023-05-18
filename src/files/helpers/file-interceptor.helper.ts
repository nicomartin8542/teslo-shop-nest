import { FilesInterceptor } from '@nestjs/platform-express';
import { storageData } from './storage.helpers';

export const fileInterceptor = FilesInterceptor('file', 5, {
  storage: storageData,
});
