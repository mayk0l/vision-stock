// This file is a template and is currently not in use
// To be implemented when base service functionality is needed

import { BaseEntity } from '../models/types';

/* Base service template 
export abstract class BaseService<T extends BaseEntity> {
  constructor(protected repository: any) {}

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
*/

export {};
