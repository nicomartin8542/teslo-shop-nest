import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt } from 'class-validator';
import {
  IsNumber,
  IsString,
  MinLength,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title (unique)',
    nullable: false,
    minLength: 1,
  })
  @IsString()
  @MinLength(6)
  title: string;

  @ApiProperty({
    description: 'Product price (optional)',
    default: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Product description (optional)',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product slug (optional)',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Product stock (optional)',
    default: 1,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  //De esta forma validoq ue cada uno de los elementos que venga
  //en el array sean string
  @ApiProperty({
    description: 'Product sizes ',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'Product gender',
    default: ['men'],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    description: 'Product tags (optional)',
    default: ['shirt'],
  })
  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({
    description: 'Product images (optional)',
    default: [],
  })
  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  images?: string[];
}
