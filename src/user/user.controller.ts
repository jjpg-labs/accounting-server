import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { Response } from 'express';
import { Public } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  async createUser(@Body() data: Prisma.UserCreateInput, @Res() res: Response) {
    try {
      const user = await this.userService.createUser(data);
      const status = user ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
      res.status(status).json(user || { message: 'Could not create user' });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get()
  async getUser(
    @Res() res: Response,
    @Query('id') id?: number,
    @Query('email') email?: string,
  ) {
    if (!id && !email) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Invalid user ID or email' });
    }

    try {
      let status: number;
      let user: User | null;

      if (id) {
        user = await this.userService.get(id);
        status = user?.id ? HttpStatus.OK : HttpStatus.NO_CONTENT;
      } else {
        user = await this.userService.getByEmail(email);
        status = user?.id ? HttpStatus.OK : HttpStatus.NO_CONTENT;
      }

      res.status(status).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Put()
  async updateUser(
    @Body() data: Prisma.UserUncheckedUpdateInput,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid user ID' });
    }

    try {
      const user = (await this.userService.update(Number(data.id), data)) || {
        message: 'Could not update user',
      };
      const status = 'message' in user ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('all')
  async getUsers(@Res() res: Response) {
    try {
      const users = await this.userService.getAll();
      const status = users.length ? HttpStatus.OK : HttpStatus.NO_CONTENT;
      res.status(status).json(users);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteUser(@Query('id') id: number, @Res() res: Response) {
    if (!id) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid user ID' });
    }

    try {
      const user = (await this.userService.delete(id)) || {
        message: 'Could not delete user',
      };
      const status = 'message' in user ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(user);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
