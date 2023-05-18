import { IsString, MinLength } from 'class-validator';

export class ClientMessage {
  @IsString()
  @MinLength(5)
  message: string;
}
