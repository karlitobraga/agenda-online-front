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
        <div class="card-glow"></div>
        <div class="header">
          <div class="icon-wrapper">
            <mat-icon>install_mobile</mat-icon>
          </div>
          <div class="header-text">
            <h3>Instalar Aplicativo</h3>
            <span class="brand-badge">ZenReserve</span>
          </div>
          <button class="btn-close" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <p class="description">Para ter acesso rápido e uma experiência exclusiva em seu iPhone, adicione o <strong>ZenReserve</strong> à sua tela de início:</p>
        
        <div class="steps">
          <div class="step">
            <div class="icon-circle">
              <mat-icon>ios_share</mat-icon>
            </div>
            <div class="step-content">
               <span class="step-number">Passo 1</span>
               <span class="step-text">Toque no ícone de <strong>Compartilhar</strong> na barra inferior.</span>
            </div>
          </div>
          
          <div class="step">
            <div class="icon-circle">
              <mat-icon>add_box</mat-icon>
            </div>
            <div class="step-content">
               <span class="step-number">Passo 2</span>
               <span class="step-text">Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <button class="btn-confirm" (click)="close()">
            <span>Entendi</span>
            <mat-icon>chevron_right</mat-icon>
          </button>
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
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 24px;
    }

    .ios-tutorial-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 32px;
      padding: 32px;
      max-width: 420px;
      width: 100%;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: premiumAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      color: white;
    }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, rgba(184, 134, 11, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    @keyframes premiumAppear {
      from { transform: scale(0.9) translateY(40px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 28px;
      position: relative;
      z-index: 1;

      .icon-wrapper {
        background: linear-gradient(135deg, #B8860B, #FFD700);
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px rgba(184, 134, 11, 0.3);

        mat-icon {
          color: #000;
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .header-text {
        flex: 1;
        h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          font-family: 'Cinzel', serif;
          color: #FFD700;
        }
        .brand-badge {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
        }
      }

      .btn-close {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        mat-icon { font-size: 20px; width: 20px; height: 20px; }
      }
    }

    .description {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
      
      strong { color: #FFD700; }
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(255, 255, 255, 0.05);
      padding: 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(8px);
        border-color: rgba(184, 134, 11, 0.3);
      }

      .icon-circle {
        width: 48px;
        height: 48px;
        background: rgba(184, 134, 11, 0.2);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFD700;
        flex-shrink: 0;
      }

      .step-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .step-number {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(184, 134, 11, 0.8);
          letter-spacing: 1px;
        }

        .step-text {
          font-size: 15px;
          color: white;
          line-height: 1.4;
        }
      }
    }

    .footer {
      position: relative;
      z-index: 1;

      .btn-confirm {
        width: 100%;
        height: 60px;
        border-radius: 18px;
        background: linear-gradient(135deg, #B8860B, #8B6508);
        border: none;
        color: black;
        font-weight: 800;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(184, 134, 11, 0.4);
          background: linear-gradient(135deg, #FFD700, #B8860B);
        }

        &:active { transform: translateY(-1px); }

        span { margin-top: -2px; }
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
