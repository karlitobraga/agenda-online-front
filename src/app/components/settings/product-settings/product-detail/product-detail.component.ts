import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService, IProduct } from '../../../../services/product.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
    form: FormGroup;
    isEdit: boolean;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private dialogRef: MatDialogRef<ProductDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IProduct | null
    ) {
        this.isEdit = !!data;
        this.form = this.fb.group({
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || ''],
            price: [data?.price || 0, [Validators.required, Validators.min(0)]],
            cost: [data?.cost || 0, [Validators.required, Validators.min(0)]],
            stock: [data?.stock || 0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void { }

    save() {
        if (this.form.valid) {
            const product = { ...this.data, ...this.form.value };
            if (this.isEdit) {
                this.productService.update(this.data!.id!, product).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.productService.create(product).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }
}
