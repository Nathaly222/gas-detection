import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service'; // Servicio de autenticación para login

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // Ruta para registrar un usuario
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Ruta para iniciar sesión
  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }
    return this.authService.login(email, password); // Genera el token JWT
  }

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
}
