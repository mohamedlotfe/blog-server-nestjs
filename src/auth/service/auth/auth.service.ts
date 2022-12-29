import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable, of } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJWT(user: User): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string): Observable<string> {
    console.log(`hashPassword`, password);
    return from<string>(bcrypt.hash(password, 12));
  }

  comparePassword(
    newPassword: string,
    hashPassword: string,
  ): Observable<any | boolean> {
    console.log(`comparePassword`, newPassword, hashPassword);
    return of<any | boolean>(bcrypt.compare(newPassword, hashPassword));
  }
}
