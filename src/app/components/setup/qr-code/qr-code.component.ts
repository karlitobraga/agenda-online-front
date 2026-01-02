import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvolutionService } from '../../../services/evolution.service';

@Component({
    selector: 'app-qr-code',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit, OnDestroy {
    @Input() showBackButton: boolean = false;
    @Output() connected = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    public qrCodeBase64: string | null = null;
    public loadingQrCode: boolean = false;
    public isConnected: boolean = false;
    private connectionCheckInterval: any;

    constructor(private evolutionService: EvolutionService) { }

    ngOnInit(): void {
        this.loadQrCode();
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

    loadQrCode(): void {
        this.loadingQrCode = true;
        this.qrCodeBase64 = null;
        this.isConnected = false;

        // Initial check to see if already connected
        this.checkStatus();

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
            error: (err) => {
                console.error('Erro ao carregar QR Code', err);
                this.loadingQrCode = false;
            }
        });
    }

    private startPolling(): void {
        this.stopPolling();
        this.connectionCheckInterval = setInterval(() => {
            this.checkStatus();
        }, 3000);
    }

    private checkStatus(): void {
        const tenantId = localStorage.getItem('tenantId') ?? '';
        this.evolutionService.checkConnectionStatus(tenantId).subscribe({
            next: (res) => {
                if (res.connected) {
                    this.isConnected = true;
                    this.qrCodeBase64 = null;
                    this.stopPolling();
                }
            },
            error: () => { /* ignore errors during polling */ }
        });
    }

    onContinue(): void {
        if (this.isConnected) {
            this.connected.emit();
        }
    }

    onBack(): void {
        this.back.emit();
    }
}
