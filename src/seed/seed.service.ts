import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    this.deleteTables();
    const user = await this.instertUser();
    await this.insertSeedProduct(user);
    return `Seed executed`;
  }

  private async instertUser(): Promise<User> {
    const userSeed = initialData.user;
    const users: User[] = [];

    userSeed.forEach((user) =>
      users.push(
        this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }),
      ),
    );

    const usersDb = await this.userRepository.save(users);

    return usersDb[0];
  }

  private async deleteTables() {
    //Elimino todos los prductos
    await this.productService.deleteAllProduct();

    //Elimino usuario
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertSeedProduct(user: User) {
    const products = initialData.products;

    //Hago insert de todos los productos a la vez -> tecnica para optimizar la carga de la db
    const insertPromise = [];
    //Meto todas las promesas del create en el array para luego ejecutarlos todos de una
    products.forEach((prod) =>
      insertPromise.push(this.productService.create(prod, user)),
    );

    //Espero que todas las promesas se terminen de ejecutar
    await Promise.all(insertPromise);

    return true;
  }
}
