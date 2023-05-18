import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { IncomingHttpHeaders } from 'http';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly congifService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...allData } = createUserDto;
    try {
      const userAdd = this.userRepository.create({
        ...allData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(userAdd);
      delete userAdd.password;
      return {
        ...userAdd,
        token: this.getJwtToken({ id: userAdd.id }),
      };
    } catch (error) {
      this.handleErrorDb(error);
    }
  }

  async login(loginUseDto: LoginUserDto) {
    const { email, password } = loginUseDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Credentials not valid');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new UnauthorizedException('Credentials not valid');

    try {
      const updUser = await this.userRepository.preload({
        ...user,
        tokenRefresh: this.getJwtTokenRefresh({ id: user.id }),
      });

      await this.userRepository.save(updUser);

      delete updUser.password;
      return {
        ...updUser,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleErrorDb(error);
    }
  }

  async getStatusToken(user: User, header: IncomingHttpHeaders) {
    const reqToken = header.authorization.split(' ')[1];
    const { tokenRefresh, ...allData } = user;

    if (tokenRefresh && reqToken !== tokenRefresh)
      throw new UnauthorizedException('Refresh token invalid');

    try {
      const updUser = await this.userRepository.preload({
        ...user,
        tokenRefresh: this.getJwtTokenRefresh({ id: user.id }),
      });

      if (!updUser) throw new UnauthorizedException('User invalid');

      await this.userRepository.save(updUser);

      return {
        allData,
        token: this.getJwtToken({ id: user.id }),
        tokenRefresh: updUser.tokenRefresh,
      };
    } catch (error) {
      this.handleErrorDb(error);
    }
  }

  private getJwtToken(id: JwtPayload): string {
    const token = this.jwtService.sign(id);
    return token;
  }

  private getJwtTokenRefresh(id: JwtPayload): string {
    const token = this.jwtService.sign(id, {
      expiresIn: '7d',
      secret: this.congifService.get('SECRET_REFRESH'),
    });
    return token;
  }

  private handleErrorDb(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.status === 401) throw new UnauthorizedException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Check your logs');
  }
}
