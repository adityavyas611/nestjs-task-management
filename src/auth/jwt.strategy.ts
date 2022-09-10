import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository } from 'typeorm';
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./user.entity";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ){
        super({
            secretOrKey: 'topSecret51',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate(payload: JwtPayload): Promise<User>{
        const { username } = payload;
        const user: User = await this.usersRepository.findOne({where: {username}});

        if(!user){
            throw new UnauthorizedException();
        }
        return user;
    }
}