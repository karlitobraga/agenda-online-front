import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

interface LoginResponse {
  token: string;
  expiresAt: string;
  tenantId: string;
}

@Component({
  selector: 'app-magic-link',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="magic-link-container">
      <div class="content">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Validando acesso...</p>
      </div>
    </div>
  `,
  styles: [`
    .magic-link-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    .content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    p {
      color: #666;
      font-family: 'Roboto', sans-serif;
    }
  `]
})
export class MagicLinkComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.validateToken(token);
  }

  validateToken(token: string) {
    this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/MagicLink/validate`, { token }, {
      headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
    })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('tenantId', res.tenantId);
          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          console.error('Magic link invalid', err);
          this.router.navigate(['/login']);
        }
      });
  }
}
