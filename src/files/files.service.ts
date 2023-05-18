import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  getPathFileSystemImagen(nameFile: string) {
    const path = join(__dirname, '../../static/products', nameFile);

    if (!existsSync(path)) throw new NotFoundException(`Not found ${nameFile}`);

    return path;
  }

  uplpadFiles(files: Express.Multer.File[]) {
    const urlSecure = files.map(
      (f) =>
        `${this.configService.get('HOSTNAME')}/v1/files/product/${f.filename}`,
    );
    return urlSecure;
  }
}
