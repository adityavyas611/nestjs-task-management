import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>    
    ){}

    async register(authCredentialsDto: AuthCredentialsDto): Promise<void> {
            const { username, password} = authCredentialsDto;
            //hashing the user password
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);
            const user = this.usersRepository.create({username, password: passwordHash});
            try{
                await this.usersRepository.save(user); 
            } catch(error) {
                if(error.code === "23505"){
                    throw new ConflictException('Username already exists');
                } else {
                    console.log(error);
                    throw new InternalServerErrorException();
                }
            }
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const {username, password} = authCredentialsDto;
        const user = await this.usersRepository.findOne({ where : { username } });

        if(user && (await bcrypt.compare(password, user.password))){
            return 'Success';
        } else {
            throw new UnauthorizedException('Please check your login credentials');
        }
    }
}
