import { BadRequestException, Injectable, InternalServerErrorException, 
         UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateUserDto  } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name )
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async create( createUserDto: CreateUserDto ): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        password: bcrypt.hashSync( password, 10 ),
        ...userData
      });
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      return user;      
    } catch( error ) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`${ createUserDto.email } already exists.`);
      }
      throw new InternalServerErrorException( 'Something terrible happend!!!' );
    }
  }

  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if( !user ) {
      throw new UnauthorizedException( 'Not valid credentials - Email.' );
    }
    if( !bcrypt.compareSync( password, user.password ) ) {
      throw new UnauthorizedException( 'Not valid credentials - Password.' );
    }
    const { password:_, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJWT({ id: user._id })
    };
  }

  async register( registerUserDto: RegisterUserDto ): Promise<LoginResponse> {
    const user = await this.create( registerUserDto );
    return {
      user,
      token: this.getJWT({ id: user._id })
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string) {
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne( id: number ) {
    return `This action returns a #${ id } auth`;
  }

  update( id: number, updateUserDto: UpdateUserDto ) {
    return `This action updates a #${ id } auth`;
  }

  remove( id: number ) {
    return `This action removes a #${ id } auth`;
  }

  getJWT( payload: JwtPayload ) {
    return this.jwtService.sign( payload );
  }
}
