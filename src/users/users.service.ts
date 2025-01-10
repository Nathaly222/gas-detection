import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un usuario
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const user = await this.prisma.users.create({
        data: { ...createUserDto, password: hashedPassword },
      });
      return { status: 'success', data: user };
    } catch (error) {
      throw new BadRequestException('Error creating user: ' + error.message);
    }
  }

  // Validar credenciales de usuario
  async validateUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Obtener usuario por ID
  async getUserById(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { status: 'success', data: user };
  }

  // Actualizar datos del usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    try {
      const user = await this.prisma.users.update({
        where: { id },
        data: updateUserDto,
      });
      return { status: 'success', data: user };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  // Eliminar cuenta de usuario
  async remove(id: number) {
    try {
      await this.prisma.users.delete({ where: { id } });
      return { status: 'success', message: `User with ID ${id} has been deleted` };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
