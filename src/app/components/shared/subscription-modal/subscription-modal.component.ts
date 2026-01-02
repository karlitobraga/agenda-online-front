import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubscriptionService } from '../../../services/subscription.service';

@Component({
  selector: 'app-subscription-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="subscription-card">
        <mat-card-header>
            <div mat-card-avatar class="avatar-icon">
                <mat-icon>verified</mat-icon>
            </div>
            <mat-card-title>Assinatura AgendeHora</mat-card-title>
            <mat-card-subtitle>Desbloqueie todo o potencial do seu negócio</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
            <div class="alert-box">
                <mat-icon>warning</mat-icon>
                <span>Seu período de teste acabou. Assine para continuar.</span>
            </div>

            <h3>O que você ganha:</h3>
            <mat-list>
                <mat-list-item>
                    <mat-icon matListItemIcon>check_circle</mat-icon>
                    <div matListItemTitle>Agendamentos Ilimitados</div>
                </mat-list-item>
                <mat-list-item>
                    <mat-icon matListItemIcon>check_circle</mat-icon>
                    <div matListItemTitle>Integração com WhatsApp</div>
                </mat-list-item>
                <mat-list-item>
                    <mat-icon matListItemIcon>check_circle</mat-icon>
                    <div matListItemTitle>Gestão de Serviços e Horários</div>
                </mat-list-item>
                <mat-list-item>
                    <mat-icon matListItemIcon>check_circle</mat-icon>
                    <div matListItemTitle>Suporte Prioritário</div>
                </mat-list-item>
            </mat-list>

            <div class="price-tag">
                <span class="currency">R$</span>
                <span class="value">30,00</span>
                <span class="period">/mês</span>
            </div>
        </mat-card-content>

        <mat-card-actions align="end">
            <button mat-flat-button color="primary" (click)="subscribe()" [disabled]="isLoading" class="pay-btn">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">ASSINAR AGORA</span>
            </button>
        </mat-card-actions>
        
        <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>
    </mat-card>
  `,
  styles: [`
    .subscription-card { max-width: 450px; width: 100%; padding: 20px; text-align: center; }
    .avatar-icon { background-color: #673ab7; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 40px; height: 40px; }
    .avatar-icon mat-icon { color: white; }
    .alert-box { background-color: #fff3e0; color: #e65100; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; margin: 20px 0; font-weight: 500; }
    h3 { text-align: left; margin-top: 20px; }
    mat-list-item mat-icon { color: #4caf50; }
    .price-tag { margin: 30px 0; font-size: 2rem; color: #333; font-weight: bold; }
    .currency { font-size: 1.2rem; vertical-align: super; }
    .value { font-size: 2.5rem; }
    .period { font-size: 1rem; color: #666; font-weight: normal; }
    .pay-btn { width: 100%; height: 50px; font-size: 1.1rem; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .error-msg { color: #f44336; margin-top: 16px; font-size: 14px; }
  `]
})
export class SubscriptionModalComponent {
  isLoading = false;
  errorMsg = '';

  constructor(
    private subscriptionService: SubscriptionService,
    public dialogRef: MatDialogRef<SubscriptionModalComponent>
  ) {
    dialogRef.disableClose = true;
  }

  subscribe() {
    this.isLoading = true;
    this.errorMsg = '';

    const email = this.getEmailFromToken();

    this.subscriptionService.createPreference(email).subscribe({
      next: (res) => {
        window.location.href = res.initPoint;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao criar preferência', err);
        this.errorMsg = 'Erro ao iniciar pagamento. Tente novamente.';
      }
    });
  }

  private getEmailFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return 'cliente@agendehora.com.br';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || 'cliente@agendehora.com.br';
    } catch {
      return 'cliente@agendehora.com.br';
    }
  }
}
