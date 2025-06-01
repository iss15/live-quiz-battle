import { Repository, EntityRepository } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

@EntityRepository(BaseEntity)
export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  // Common repository methods can be added here
  // For example: soft delete, audit logging, etc.
}