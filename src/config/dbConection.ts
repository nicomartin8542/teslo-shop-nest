import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const defaultDbOptions = (
  config: ConfigService,
): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: +config.get('DB_PORT'),
    database: config.get('DB_NAME'),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    autoLoadEntities: true,
    synchronize: true,
  };
};
