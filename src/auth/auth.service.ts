import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Método para iniciar sesión
  async login(email: string, password: string) {
    // Busca el usuario por su email
    const user = await this.prisma.users.findUnique({ where: { email } });

    // Verifica si el usuario existe y si la contraseña es válida
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Genera el token JWT con la información del usuario
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    // Excluye la contraseña del usuario en la respuesta
    const { password: _, ...userData } = user;

    // Devuelve el token y los datos del usuario
    return { 
      status: 'success', 
      data: { token, user: userData } 
    };
  }

  // Método para registrar un nuevo usuario
  async register({ username, email, password, phone }: { username: string; email: string; password: string; phone: string }) {
    // Verifica si el email ya está registrado
    const existingUser = await this.prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hashea la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario en la base de datos
    const user = await this.prisma.users.create({
      data: { 
        username, 
        email, 
        password: hashedPassword, 
        phone 
      },
    });

    // Excluye la contraseña del usuario en la respuesta
    const { password: _, ...userData } = user;

    // Devuelve los datos del usuario
    return { 
      status: 'success', 
      data: userData 
    };
  }
}
