import {
  Controller,
  Param,
  Post,
  Res,
  UseInterceptors,
  Get,
  UploadedFiles,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { parseFilePipe, fileInterceptor } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:nameFile')
  getProductFile(@Res() res: Response, @Param('nameFile') nameFile: string) {
    const path = this.filesService.getPathFileSystemImagen(nameFile);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(fileInterceptor)
  uploadProductFile(
    @UploadedFiles(parseFilePipe)
    files: Express.Multer.File[],
  ) {
    return this.filesService.uplpadFiles(files);
  }
}
