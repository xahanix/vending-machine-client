import { Coin } from './coin.model';

export interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
}

export interface ProductRequestDto {
  name: string;
  price: number;
  inventory: number;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}
