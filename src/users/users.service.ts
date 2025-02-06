import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo ya está en uso');
      }
      const userRole = await this.prisma.role.findUnique({
        where: { name: RoleType.USER }, 
      });

      if (!userRole) {
        throw new BadRequestException('No se encontró el rol USER en la base de datos');
      }

      const user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          phone: createUserDto.phone,
          password: hashedPassword,
          roleId: userRole.id,
        },
        include: {
          role: true, 
        },
      });

      return { status: 'success', data: user };
    } catch (error) {
      throw new BadRequestException('Error creando usuario: ' + error.message);
    }
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }, 
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { status: 'success', data: user };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        include: { role: true },
      });

      return { status: 'success', data: user };
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { status: 'success', message: `Usuario con ID ${id} ha sido eliminado` };
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
