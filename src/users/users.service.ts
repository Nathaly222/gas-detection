import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un usuario con un rol predeterminado (USER)
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
   
    try {
      // Primero, busca o crea el rol USER
      const userRole = await this.prisma.role.findFirst({
        where: { name: RoleType.USER }
      }) || await this.prisma.role.create({
        data: { name: RoleType.USER }
      });

      // Luego, crea el usuario y conecta con el rol
      const user = await this.prisma.users.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          phone: createUserDto.phone,
          password: hashedPassword,
          roleId: userRole.id, // Asigna el roleId directamente
          roles: {
            connect: { id: userRole.id } // Conecta con el rol existente
          }
        },
        include: {
          roles: true // Incluye los roles en la respuesta
        }
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
