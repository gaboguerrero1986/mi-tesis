import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TablaMaestra } from './tabla-maestra.entity';
import { Parametro } from './parametro.entity';
import { EjecucionParametro } from './ejecucion-parametro.entity';

@Injectable()
export class EavService {
    constructor(
        @InjectRepository(TablaMaestra)
        private tablaMaestraRepo: Repository<TablaMaestra>,
        @InjectRepository(Parametro)
        private parametroRepo: Repository<Parametro>,
        @InjectRepository(EjecucionParametro)
        private ejecucionRepo: Repository<EjecucionParametro>
    ) {}

    // Get or Create Entity in Tabla Maestra
    async getOrCreateEntity(nombreEntidad: string): Promise<TablaMaestra> {
        let entidad = await this.tablaMaestraRepo.findOne({ where: { nombre_entidad: nombreEntidad } });
        if (!entidad) {
            entidad = this.tablaMaestraRepo.create({ nombre_entidad: nombreEntidad });
            entidad = await this.tablaMaestraRepo.save(entidad);
        }
        return entidad;
    }

    // Get all parameters for a specific entity
    async getParametersByEntity(nombreEntidad: string, activeOnly: boolean = false): Promise<Parametro[]> {
        const where: any = { entidad: { nombre_entidad: nombreEntidad } };
        if (activeOnly) {
            where.is_active = true;
        }
        return this.parametroRepo.find({
            where,
            relations: ['entidad']
        });
    }

    // Create a new parameter definition
    async createParameter(nombreEntidad: string, descripcion: string, tipoDato: string): Promise<Parametro> {
        const entidad = await this.getOrCreateEntity(nombreEntidad);
        const parametro = this.parametroRepo.create({
            entidad_id: entidad.id,
            descripcion,
            tipo_dato: tipoDato
        });
        return this.parametroRepo.save(parametro);
    }

    // Delete a parameter definition
    async deleteParameter(id: number): Promise<void> {
        await this.ejecucionRepo.delete({ parametro_id: id }); // Delete values first
        await this.parametroRepo.delete(id); // Delete definition
    }

    // Toggle active status
    async toggleParameter(id: number): Promise<Parametro> {
        const parametro = await this.parametroRepo.findOne({ where: { id } });
        if (parametro) {
            parametro.is_active = !parametro.is_active;
            return this.parametroRepo.save(parametro);
        }
        throw new Error('Parameter not found');
    }

    // Save a value for a specific record
    async saveParameterValue(registroId: string, parametroId: number, valor: string | number): Promise<EjecucionParametro | null> {
        if (valor === undefined || valor === null || valor === '') return null;
        
        let ejecucion = await this.ejecucionRepo.findOne({
            where: { registro_id: registroId, parametro_id: parametroId }
        });

        if (!ejecucion) {
            ejecucion = this.ejecucionRepo.create({ registro_id: registroId, parametro_id: parametroId });
        }

        const parametro = await this.parametroRepo.findOne({ where: { id: parametroId } });
        if (!parametro) return null;

        if (parametro.tipo_dato === 'number') {
            ejecucion.valor_numerico = Number(valor);
            ejecucion.valor_texto = null as any;
        } else {
            ejecucion.valor_texto = String(valor);
            ejecucion.valor_numerico = null as any;
        }

        return this.ejecucionRepo.save(ejecucion);
    }

    // Get all custom values for a specific record
    async getValuesByRecord(registroId: string): Promise<EjecucionParametro[]> {
        return this.ejecucionRepo.find({
            where: { registro_id: registroId },
            relations: ['parametro']
        });
    }
}
