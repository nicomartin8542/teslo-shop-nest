import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from './guards/user-role.guard';
import { GetUser, Roles, Auth } from './decorators';
import { GetRawHeader } from 'src/common/decorators/row.header.decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interface';
import { IncomingHttpHeaders } from 'http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('status-token')
  @Auth()
  getStatusToken(
    @GetUser() user: User,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return this.authService.getStatusToken(user, headers);
  }

  @Get('user')
  @UseGuards(AuthGuard())
  getUsers(
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @GetRawHeader() rawHeader: string[],
  ) {
    return {
      ok: true,
      msg: 'Correct',
      user,
      userEmail,
      rawHeader,
    };
  }

  //Ruta con decoradoes de autenticacion y autorizacion de forma individual
  @Get('user2')
  @Roles(ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  getUsers2(@GetUser() user: User) {
    return {
      ok: true,
      msg: 'Correct',
      user,
    };
  }

  //Creamos un docorados de barril (Compuesto de varios decoradores) para la autenticacion y autorizacion
  @Get('user3')
  @Auth(ValidRoles.admin, ValidRoles.user)
  getUsers3(@GetUser() user: User) {
    return {
      ok: true,
      msg: 'Correct',
      user,
    };
  }
}
