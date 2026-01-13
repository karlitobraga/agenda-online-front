import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProductService, IProduct } from '../../../services/product.service';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-product-settings',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
    templateUrl: './product-settings.component.html',
    styleUrl: './product-settings.component.scss'
})
export class ProductSettingsComponent implements OnInit {
    products: IProduct[] = [];
    displayedColumns: string[] = ['name', 'price', 'cost', 'stock', 'actions'];

    constructor(
        private productService: ProductService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getAll().subscribe(products => {
            this.products = products;
        });
    }

    openProductDialog(product?: IProduct) {
        const dialogRef = this.dialog.open(ProductDetailComponent, {
            width: '500px',
            data: product ? { ...product } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadProducts();
            }
        });
    }

    deleteProduct(product: IProduct) {
        if (confirm(`Deseja realmente excluir o produto ${product.name}?`)) {
            this.productService.delete(product.id!).subscribe(() => {
                this.snackBar.open('Produto excluído com sucesso', 'Fechar', { duration: 3000 });
                this.loadProducts();
            });
        }
    }
}
