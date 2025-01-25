import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    // Configura el módulo de pruebas e inyecta servicios simulados (mocks).
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(), // Simula la búsqueda de un usuario en la base de datos.
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockToken'), // Simula la generación de un token JWT.
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService); // Obtiene la instancia de AuthService.
    prismaService = module.get<PrismaService>(PrismaService); // Obtiene la instancia de PrismaService.
  });

  describe('login', () => {
    it('debería devolver un token JWT si las credenciales son correctas', async () => {
      // Crea un usuario simulado con una contraseña cifrada.
      const mockUser = {
        id: 1,
        username: 'TestUser',
        email: 'test@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('correct_password', 10), // Cifra la contraseña.
        roleId: 1,
      };

      // Simula que el usuario se encuentra en la base de datos.
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

      // Llama al método login con credenciales correctas y verifica que devuelve el token y los datos del usuario.
      const result = await authService.login('test@example.com', 'correct_password');
      expect(result).toEqual({
        status: 'success',
        data: {
          token: 'mockToken', // El token simulado que se espera.
          user: mockUser, // Los datos del usuario.
        },
      });
    });

    it('debería lanzar UnauthorizedException si el email no existe', async () => {
      // Simula que no se encuentra el usuario en la base de datos.
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      // Verifica que se lanza UnauthorizedException cuando no se encuentra el email.
      await expect(authService.login('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // Crea un usuario simulado con la contraseña correcta.
      const mockUser = {
        id: 1,
        username: 'TestUser',
        email: 'test@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('correct_password', 10),
        roleId: 1,
      };

      // Simula que el usuario se encuentra en la base de datos.
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

      // Verifica que se lanza UnauthorizedException cuando la contraseña es incorrecta.
      await expect(authService.login('test@example.com', 'wrong_password')).rejects.toThrow(UnauthorizedException);
    });
  });
});
