import { IsNotEmpty, MinLength, IsString } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
