import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product, ProductRequestDto } from '../models/product.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  async getProducts(): Promise<Product[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ products: Product[] }>(this.apiUrl)
      );
      return response.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async createProduct(product: ProductRequestDto): Promise<Product> {
    try {
      return await firstValueFrom(
        this.http.post<Product>(this.apiUrl, product)
      );
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(id: string, product: ProductRequestDto): Promise<Product> {
    try {
      return await firstValueFrom(
        this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      );
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async purchaseProduct(productId: string): Promise<Product> {
    try {
      // API specification requires a GET request with the product ID in the path
      return await firstValueFrom(
        this.http.get<Product>(`${environment.apiUrl}/vendingmachine/product/${productId}`)
      );
    } catch (error) {
      console.error('Error purchasing product:', error);
      // Re-throw the original error to allow for more specific error handling in the store
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`)
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}
