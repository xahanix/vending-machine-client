import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../core/models/Product/product.model';
import { CommonModule } from '@angular/common';
import {ProductRequestDto} from '../../../core/models/Product/ProductRequestDto';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product;
  @Output() save = new EventEmitter<ProductRequestDto>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  productForm!: FormGroup;

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: [this.product ? this.product.name : '', Validators.required],
      price: [this.product ? this.product.price : null, [Validators.required, Validators.min(0.05)]],
      inventory: [this.product ? this.product.inventory : 0, [Validators.required, Validators.min(0)]]
    });
  }

  get isEditMode(): boolean {
    return !!this.product;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData: ProductRequestDto = {
        name: this.productForm.value.name,
        price: this.productForm.value.price,
        inventory: this.productForm.value.inventory
      };
      this.save.emit(productData);
    }
  }
}
