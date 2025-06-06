export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  name: string;
}

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  stock: number;
}
