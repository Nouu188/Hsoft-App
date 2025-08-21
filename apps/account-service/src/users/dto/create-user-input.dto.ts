import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateUserByEmailInput {
    @Field()
    @IsString()
    email: string;

    @Field()
    @IsString()
    hoten: string;

    @Field()
    @IsString()
    password: string;
}

@InputType()
export class CreateUserByIdentifierInput {
    @Field({ nullable: true })
    @IsString()
    mabn?: string;

    @Field()
    @IsString()
    hoten: string;

    @Field({ nullable: true })
    @IsString()
    sodienthoai?: string;

    @Field({ nullable: true })
    @IsString()
    socmnd?: string;

    @Field({ nullable: true })
    @IsString()
    namsinh?: string;

    @Field()
    @IsString()
    password?: string;
}