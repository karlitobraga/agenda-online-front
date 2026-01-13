import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ProductService, IProduct } from '../../../services/product.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface CartItem {
    product: IProduct;
    quantity: number;
}

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, MatSnackBarModule],
    templateUrl: './sales.component.html',
    styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit {
    products: IProduct[] = [];
    filteredProducts: IProduct[] = [];
    cart: CartItem[] = [];
    searchTerm: string = '';

    constructor(
        private productService: ProductService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getAll().subscribe(products => {
            this.products = products;
            this.filteredProducts = products;
        });
    }

    filterProducts() {
        this.filteredProducts = this.products.filter(p =>
            p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    addToCart(product: IProduct) {
        const existing = this.cart.find(c => c.product.id === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            this.cart.push({ product, quantity: 1 });
        }
    }

    removeFromCart(item: CartItem) {
        const index = this.cart.indexOf(item);
        if (index > -1) {
            this.cart.splice(index, 1);
        }
    }

    updateQuantity(item: CartItem, delta: number) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            this.removeFromCart(item);
        }
    }

    getTotal(): number {
        return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }

    finalizeSale() {
        if (this.cart.length === 0) return;

        // TODO: Call SaleService to register sale on backend
        this.snackBar.open('Venda finalizada com sucesso! (Funcionalidade de backend em breve)', 'Fechar', { duration: 3000 });
        this.cart = [];
    }
}
