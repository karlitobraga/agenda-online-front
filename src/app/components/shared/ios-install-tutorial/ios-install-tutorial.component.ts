import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PwaService } from '../../../services/pwa.service';

@Component({
    selector: 'app-ios-install-tutorial',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    template: `
    <div class="ios-tutorial-overlay" *ngIf="pwaService.showIosTutorial()">
      <div class="ios-tutorial-card">
        <div class="header">
          <mat-icon>install_mobile</mat-icon>
          <h3>Instalar Aplicativo</h3>
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <p>Para ter acesso rápido e uma experiência melhor, adicione o TinyPet à sua tela de início:</p>
        
        <div class="steps">
          <div class="step">
            <div class="icon-circle">
              <mat-icon>ios_share</mat-icon>
            </div>
            <span>1. Toque no ícone de <strong>Compartilhar</strong> na barra de navegação.</span>
          </div>
          
          <div class="step">
            <div class="icon-circle">
              <mat-icon>add_box</mat-icon>
            </div>
            <span>2. Selecione a opção <strong>Adicionar à Tela de Início</strong>.</span>
          </div>
        </div>

        <div class="footer">
          <button mat-flat-button color="primary" (click)="close()">Entendi</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .ios-tutorial-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 20px;
    }

    .ios-tutorial-card {
      background: white;
      border-radius: 24px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      mat-icon {
        color: var(--primary-color, #673ab7);
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h3 {
        margin: 0;
        flex: 1;
        font-size: 20px;
        font-weight: 600;
      }
    }

    p {
      color: #666;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 16px;

      .icon-circle {
        width: 40px;
        height: 40px;
        background: #f0f0f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
      }

      span {
        flex: 1;
        font-size: 15px;
      }
    }

    .footer {
      display: flex;
      justify-content: flex-end;

      button {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-weight: 600;
      }
    }
  `]
})
export class IosInstallTutorialComponent {
    public pwaService = inject(PwaService);

    close() {
        this.pwaService.showIosTutorial.set(false);
    }
}
