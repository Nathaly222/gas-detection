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

  private generateAccessToken(user: any): string {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role ? user.role.name : 'USER',  
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }
  

  private generateRefreshToken(user: any): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }

    const payload = { sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '7d', secret });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }, 
    });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
  
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
  
    const { password: _, ...userData } = user;
    userData.role = user.role; 
  
    return { 
      status: 'success', 
      data: { accessToken, refreshToken, user: userData } 
    };
  }
  
  
  

  async register({
    username, 
    email, 
    password, 
    phone,
  }: { 
    username: string; 
    email: string; 
    password: string; 
    phone: string; 
  }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const userRole = await this.prisma.role.findFirst({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new Error('Default role USER not found in the database.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword, 
        phone, 
        roleId: userRole.id,
      },
    });

    const { password: _, ...userData } = user;
    return { 
      status: 'success', 
      data: userData 
    };
  }

  async refresh(refreshToken: string) {
    try {
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
      }

      const decoded = this.jwtService.verify(refreshToken, { secret });

      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
