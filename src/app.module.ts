import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './config/schema-env-joi.config';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { defaultDbOptions } from './config/dbConection';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: defaultDbOptions,
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'Public'),
    // }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    AuthModule,
    MessagesWsModule,
  ],
})
export class AppModule {
  //Esto es opcional, para que pueda recuperar el port de la configService
  static port: number;
  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.get('PORT');
  }
}
