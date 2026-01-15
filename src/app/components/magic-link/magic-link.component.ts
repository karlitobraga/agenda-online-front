import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-magic-link',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="magic-link-container">
      <div class="content" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Validando link de acesso...</p>
      </div>
      
      <div class="content error" *ngIf="error">
        <mat-icon>error_outline</mat-icon>
        <h2>Link Inválido</h2>
        <p>{{ error }}</p>
        <a href="/login">Ir para Login</a>
      </div>
    </div>
  `,
  styles: [`
    .magic-link-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Outfit', sans-serif;
    }
    
    .content {
      text-align: center;
      color: white;
      
      mat-spinner { margin: 0 auto 24px; }
      
      p { font-size: 1.1rem; opacity: 0.9; }
      
      &.error {
        background: white;
        padding: 48px;
        border-radius: 24px;
        color: #1e293b;
        
        mat-icon {
          font-size: 64px;
          height: 64px;
          width: 64px;
          color: #ef4444;
          margin-bottom: 16px;
        }
        
        h2 { margin-bottom: 8px; }
        
        a {
          display: inline-block;
          margin-top: 24px;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }
      }
    }
  `]
})
export class MagicLinkComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error = 'Token não fornecido.';
      this.loading = false;
      return;
    }

    this.http.post<any>(`${environment.apiUrl}/Auth/MagicLink/validate`, { token }, {
      headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
    })
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('tenantId', response.tenantId);
          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Link inválido ou expirado.';
          this.loading = false;
        }
      });
  }
}
