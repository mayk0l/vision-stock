// This file is a template and is currently not in use
// To be implemented when database integration is needed

import { BaseEntity } from '../models/types';

/* Base repository template
export abstract class BaseRepository<T extends BaseEntity> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: number): Promise<T | null>;
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: number, data: Partial<T>): Promise<T>;
  abstract delete(id: number): Promise<void>;
}
*/

export {};
