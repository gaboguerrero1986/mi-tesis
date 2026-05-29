import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Persona } from './persona.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Usuario)
        private usuariosRepository: Repository<Usuario>,
        @InjectRepository(Persona)
        private personasRepository: Repository<Persona>,
    ) { }

    async findOne(correo: string): Promise<Usuario | null> {
        return this.usuariosRepository.findOne({
            where: { correo },
            relations: ['persona']
        });
    }

    async create(userData: Partial<Usuario>, personaData: Partial<Persona>): Promise<Usuario> {
        const password = userData.password_hash || 'temporal123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        let persona = this.personasRepository.create(personaData);
        persona = await this.personasRepository.save(persona);

        const usuario = this.usuariosRepository.create({
            ...userData,
            password_hash: hashedPassword,
            persona_id: persona.id,
        });
        return this.usuariosRepository.save(usuario);
    }

    async update(id: string, userData: Partial<Usuario>, personaData: Partial<Persona>): Promise<Usuario | null> {
        const user = await this.usuariosRepository.findOne({ where: { id }, relations: ['persona'] });
        if (!user) return null;

        if (personaData && Object.keys(personaData).length > 0) {
            await this.personasRepository.update(user.persona.id, personaData);
        }
        
        if (userData && Object.keys(userData).length > 0) {
            await this.usuariosRepository.update(id, userData);
        }

        return this.usuariosRepository.findOne({ where: { id }, relations: ['persona'] });
    }
    
    async findAll(): Promise<Usuario[]> {
        return this.usuariosRepository.find({ relations: ['persona'] });
    }

    async findAllByRole(role: string): Promise<Usuario[]> {
        return this.usuariosRepository.find({ where: { rol_sistema: role }, relations: ['persona'] });
    }

    async remove(id: string): Promise<void> {
        await this.usuariosRepository.delete(id);
    }

    async resetPassword(id: string): Promise<Usuario | null> {
        const defaultPassword = await bcrypt.hash('temporal123', 10);
        await this.usuariosRepository.update(id, { password_hash: defaultPassword });
        return this.usuariosRepository.findOne({ where: { id } });
    }

    async changePassword(id: string, oldPass: string, newPass: string): Promise<Usuario | null> {
        const user = await this.usuariosRepository.findOne({ where: { id } });

        if (!user || !(await bcrypt.compare(oldPass, user.password_hash))) {
            return null;
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.usuariosRepository.update(id, { password_hash: hashedPassword });
        return this.usuariosRepository.findOne({ where: { id } });
    }
}
