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
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException('ID de usuario inválido');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        include: { role: true },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const { password, ...result } = user;
      
      return { 
        status: 'success', 
        data: result 
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener el perfil: ' + error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException('ID de usuario inválido');
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { id: Number(id) },
      });
      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const user = await this.prisma.user.update({
        where: { id: Number(id) },
        data: updateUserDto,
        include: { role: true },
      });
      return { 
        status: 'success', 
        message: 'Usuario actualizado correctamente',
        data: user 
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw new BadRequestException('Error al actualizar el usuario: ' + error.message);
    }
  }

  async remove(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    try {
      await this.prisma.user.delete({ where: { id: Number(id) } });
      return { status: 'success', message: `Usuario con ID ${id} ha sido eliminado` };
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
