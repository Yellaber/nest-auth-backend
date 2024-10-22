import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateUserDto } from './dto';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller( 'auth' )
export class AuthController {
  constructor( private readonly authService: AuthService ) {}

  @Post()
  create( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post( '/login' )
  login(@Body() loginDto: LoginDto ) {
    return this.authService.login( loginDto );
  }

  @Post( '/register' )
  register( @Body() registerUserDto: RegisterUserDto ) {
    return this.authService.register( registerUserDto );
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards( AuthGuard )
  @Get( 'check-token' )
  checkToken( @Request() request: Request ): LoginResponse {
    const user = request[ 'user' ] as User;
    return {
      user,
      token: this.authService.getJWT({ id: user._id })
    };
  }

  /*@Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.authService.findOne( +id );
  }

  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateUserDto: UpdateUserDto ) {
    return this.authService.update( +id, updateUserDto );
  }

  @Delete( ':id' )
  remove( @Param( 'id' ) id: string ) {
    return this.authService.remove( +id );
  }*/
}
