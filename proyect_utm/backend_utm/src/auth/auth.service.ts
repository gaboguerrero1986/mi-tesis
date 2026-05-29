import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(correo: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(correo);
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, ...result } = user;
            // Check if using default password
            if (pass === 'temporal123') {
                return { ...result, mustChangePassword: true };
            }
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.correo, sub: user.id, role: user.rol_sistema };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.correo,
                role: user.rol_sistema,
                persona: user.persona
            },
            mustChangePassword: user.mustChangePassword || false
        };
    }

    async register(body: any) {
        const { usuarioData, personaData } = body;
        return this.usersService.create(usuarioData, personaData);
    }

    async studentLogin(correo: string) {
        let user = await this.usersService.findOne(correo);

        if (!user) {
            // Auto-register logic for assistants
            user = await this.usersService.create(
                { correo: correo, password_hash: 'asistente-no-password', rol_sistema: 'student', usuario: correo.split('@')[0] },
                { nombres: 'Asistente', apellidos: 'UTM' }
            );
        } else {
            // Validate that the user is actually an assistant/student to prevent admin takeover
            if (user.rol_sistema !== 'student') {
                throw new UnauthorizedException('Este correo pertenece a un Jurado o Administrador. Ingrese con su contraseña en el rol correspondiente.');
            }
        }

        return this.login(user);
    }
}
