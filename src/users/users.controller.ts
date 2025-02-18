import { 
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service'; 
import { RoleProtected } from 'src/auth/dto/decorators/role-protected-decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UserRoleGuard } from '../auth/guards/user-role.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log('Token payload:', req.user);
    console.log('User ID:', req.user?.userId); // Cambiado a userId

    try {
      if (!req.user || !req.user.userId) {
        throw new BadRequestException('Usuario no autenticado correctamente');
      }

      return await this.usersService.getUserById(req.user.userId); // Cambiado a userId
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  // Actualizar el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateProfile(@Req() req, @Body() updateData: UpdateUserDto) {
    try {
      const result = await this.usersService.update(req.user.userId, updateData); 
      return result;
    } catch (error) {
      throw error;
    }
  }


  // Eliminar la cuenta del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteAccount(@Req() req) {
    return this.usersService.remove(req.user.sub);
  }

  // Ruta protegida para administradores
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  @RoleProtected(ValidRoles.ADMIN)
  @Get('admin-only')
  async adminOnly() {
    return { message: 'This route is accessible only to admins' };
  }
}
