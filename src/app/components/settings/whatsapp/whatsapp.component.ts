import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { EvolutionService } from '../../../services/evolution.service';

@Component({
    selector: 'app-whatsapp',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './whatsapp.component.html',
    styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit, OnDestroy {
    public qrCodeBase64: string | null = null;
    public loadingQrCode: boolean = false;
    public isConnected: boolean = false;
    private connectionCheckInterval: any;

    constructor(
        private router: Router,
        private evolutionService: EvolutionService
    ) { }

    ngOnInit(): void {
        this.checkStatus();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    private stopPolling(): void {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    checkStatus(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.evolutionService.checkConnectionStatus(tenantId).subscribe({
            next: (res) => {
                this.isConnected = res?.connected ?? false;
                if (!this.isConnected) {
                    this.loadQrCode();
                }
            },
            error: () => {
                this.isConnected = false;
                this.loadQrCode();
            }
        });
    }

    loadQrCode(): void {
        this.loadingQrCode = true;
        this.qrCodeBase64 = null;

        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.evolutionService.getQrCode(tenantId).subscribe({
            next: (res) => {
                let code = res.qrcode;
                if (code && !code.startsWith('data:image')) {
                    code = 'data:image/png;base64,' + code;
                }
                this.qrCodeBase64 = code;
                this.loadingQrCode = false;
                this.startPolling();
            },
            error: () => {
                this.loadingQrCode = false;
            }
        });
    }

    private startPolling(): void {
        this.stopPolling();
        this.connectionCheckInterval = setInterval(() => {
            const tenantId = localStorage.getItem('tenantId') ?? '';
            this.evolutionService.checkConnectionStatus(tenantId).subscribe({
                next: (res) => {
                    if (res.connected) {
                        this.isConnected = true;
                        this.qrCodeBase64 = null;
                        this.stopPolling();
                    }
                }
            });
        }, 3000);
    }

    goBack(): void {
        this.router.navigate(['/inicio']);
    }
}
