import {Product} from "../../models/Product/product.model";

export interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}
