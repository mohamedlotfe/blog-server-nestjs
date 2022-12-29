import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { UserEntity } from 'src/user/models/user.entity';
import { User } from 'src/user/models/user.interface';
import { Repository } from 'typeorm';
import { catchError, switchMap, map } from 'rxjs/operators';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.email = user.email;
        newUser.name = user.name;
        newUser.username = user.username;
        newUser.password = passwordHash;
        newUser.role = user.role;

        return from(this.userRepo.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...res } = user;
            return res;
          }),
          catchError((err) => throwError(err)),
        );
      }),
    );
  }
  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } })).pipe(
      map((user: User) => {
        const { password, ...res } = user;
        return res;
      }),
    );
  }
  findAll(): Observable<User[]> {
    return from(this.userRepo.find({})).pipe(
      map((users: User[]) => {
        users.forEach((user) => {
          delete user.password;
          return user;
        });
        return users;
      }),
    );
  }
  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepo, options)).pipe(
      map((userPage: Pagination<User>) => {
        userPage.items.forEach((user) => {
          delete user.password;
          return user;
        });
        return userPage;
      }),
    );
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete({ id }));
  }

  updateOne(id: number, user: User): Observable<any> {
    delete user.password;
    return from(this.userRepo.update(id, user));
  }
  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) return this.authService.generateJWT(user).pipe((jwt) => jwt);
        else throw Error('Unauthorized user!');
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return this.findByEmail(email).pipe(
      switchMap((user: User) => {
        return this.authService.comparePassword(password, user.password).pipe(
          map((isMatched: boolean) => {
            if (isMatched) {
              const { password, ...res } = user;
              return res;
            }
            throw Error;
          }),
        );
      }),
    );
  }
  findByEmail(email: string): Observable<User> {
    return from(this.userRepo.findOne({ where: { email } }));
  }

  updateUserRole(id: number, user: User): Observable<any> {
    return from(this.userRepo.update(id, user));
  }
}
