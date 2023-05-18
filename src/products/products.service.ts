import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productDetails } = createProductDto;

    try {
      //Creamos product y cargamos las imagenes en la otra tabla
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((url) =>
          this.productImageRepository.create({ url }),
        ),
        user,
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDbException(error);
    }
  }

  //Paginar
  async findAll(pagination: PaginationDto) {
    const { limit = 2, offset = 0 } = pagination;
    try {
      const products: Product[] = await this.productRepository.find({
        take: limit,
        skip: offset,
        //No hace falta para el find all si tenemos la opcion eager en true en nuestra entity
        //relations: { images: true },
      });

      return products.map((product) => ({
        ...product,
        images: product.images.map(({ url }) => url),
      }));
    } catch (error) {
      this.handleDbException(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    //Valid uuid
    if (this.checkIfValidUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //Creamos un querybuielder para hacer una consulta mas personalizada y le colocamos de nombre prod
      const querybuilder = this.productRepository.createQueryBuilder('prod');
      product = await querybuilder
        .where(`UPPER(title) = :title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        //Este leftjoin lo usamos unicamente cuando tengamos un query builder, para traer la relacion de tabla
        .leftJoinAndSelect('prod.images', 'prodImage')
        .getOne();
    }

    if (!product) throw new NotFoundException('Product not found!');
    return product;
  }

  //Metodo para devolver un objeto con los campos filtrados
  async findOnePlain(term: string) {
    const product = await this.findOne(term);

    const { images = [], ...details } = product;

    return {
      ...details,
      images: images.map(({ url }) => url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    //Hacemos el preload de la data para hacer el update
    const product = await this.productRepository.preload({
      ...toUpdate,
      id,
      user,
      images: [],
    });

    if (!product) throw new NotFoundException('Product not found!');

    //Creamos un queryRunner para poder realizar otras transacciones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Verificamos si vienen imagenes en el body, eliminamos las anteriores
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: id });

        //Creamos la imagenes en la tabla productImages
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }

      //await this.productRepository.save(product); -> forma normal de actualizar los datos en la db

      //Forma con el queryRunner
      await queryRunner.manager.save(product);
      //Confirmamos la transaccion e impactamos los cambios en la db
      await queryRunner.commitTransaction();
      //Cerramos el queryRunner
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      //En caso de un error, volvemos todos los cambios como estaban antes
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDbException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDbException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error occurred, check you logs',
    );
  }

  checkIfValidUUID(str: string) {
    // Regular expression to check if string is a valid UUID
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    return regexExp.test(str);
  }

  async deleteAllProduct() {
    const query = this.productRepository.createQueryBuilder();
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbException(error);
    }
  }
}
