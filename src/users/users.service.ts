import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalize } from 'path';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.users.findMany({
      include: {events: true}
    });
    return { status: 'success', data: users}
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!user) {
      throw new NotFoundException({ status: 'fail', data: `User with ID ${id} not found`});
    }
    return { status: 'success', data: user}
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.users.create({
        data: createUserDto,
      });
      return { status: 'succes', data: user };
    } catch (error) {
      throw new BadRequestException({
        status: 'error',
        message: 'User could not be created',
        details: error.message,
      })
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.users.update({
        where: { id },
        data: updateUserDto,
      });
      return { status: 'success', data: user };
    } catch (error) {
      throw new NotFoundException({ status: 'fail', data: `User with ID ${id} not found` });
    }
  }

 async remove(id: number) {
    try {
      await this.prisma.users.delete({
        where: { id },
      });
      return { stattus: 'succes', data: `User with ID ${id} has been deleted` };
    } catch (error) {
      throw new NotFoundException({ status: 'fail', data: `User with ID ${id} not found` });
    }
  }
}
