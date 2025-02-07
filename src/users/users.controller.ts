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

  // Obtener el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.getUserById(req.user.sub);
  }

  // Actualizar el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateProfile(@Req() req, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateData);
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
