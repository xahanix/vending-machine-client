import {ProductsState} from "./ProductsState";

export const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
};
