import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  isLoading = false;
  status: 'expired' | 'success' | 'failure' | 'pending' | 'init' = 'init';
  private isBrowser: boolean;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    // Check if we are in a callback route
    const url = this.router.url;
    if (url.includes('payment/success')) {
      this.status = 'success';
      // Optimistically update storage
      localStorage.setItem('subscriptionStatus', 'ACTIVE');
    } else if (url.includes('payment/failure')) {
      this.status = 'failure';
    } else if (url.includes('payment/pending')) {
      this.status = 'pending';
    } else {
      // Logic for Paywall
      const subStatus = localStorage.getItem('subscriptionStatus');
      if (subStatus === 'ACTIVE') {
        // Already active, maybe user clicked manually?
        // For now show plan details or redirect home
        this.router.navigate(['/inicio']);
      } else {
        this.status = 'expired';
      }
    }
  }

  subscribe() {
    this.isLoading = true;

    const tenantId = localStorage.getItem('tenantId');

    if (!tenantId) {
      this.snackBar.open('Erro: Não foi possível identificar sua conta.', 'Fechar', { duration: 5000 });
      this.isLoading = false;
      return;
    }
    //

    this.subscriptionService.createPreference(tenantId).subscribe({
      next: (res) => {
        window.location.href = res.initPoint; // Redirect to Mercado Pago
      },
      error: (err) => {
        this.snackBar.open('Erro ao iniciar pagamento. Tente novamente.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  continue() {
    this.router.navigate(['/inicio']);
  }

  retry() {
    this.status = 'expired';
    this.router.navigate(['/subscription']);
  }
}
