import { diskStorage } from 'multer';
import { destinationFile } from './destination-file.helpers';
import { fileNameStorage } from './file-name.helpers';

export const storageData = diskStorage({
  destination: destinationFile,
  filename: fileNameStorage,
});
