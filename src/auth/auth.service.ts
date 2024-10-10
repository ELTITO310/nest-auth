import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.user(email);
    if (user) {
      const compare = compareSync(pass, user.password);
      if (!compare) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
    };
  }

  async register(params: Prisma.UserCreateInput) {
    const { email, password, name } = params;
    const saltRounds = genSaltSync(this.config.get('secret.SALT'));
    const hashPass = hashSync(password, saltRounds);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.usersService.createUser({
      email,
      password: hashPass,
      name,
    });

    const { access_token: token } = await this.login(user);

    return {
      access_token: token,
    };
  }
}
