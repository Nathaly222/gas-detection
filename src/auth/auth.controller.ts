import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(
    @Body() { username, email, password, phone }: { username: string; email: string; password: string; phone: string },
  ) {
    return this.authService.register({ username, email, password, phone });
  }

  @Post('refresh')
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refresh(refreshToken);
  }
}


