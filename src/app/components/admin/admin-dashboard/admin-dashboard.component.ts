import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService, TenantAdmin } from '../../../services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { InfoDialogService } from '../../shared/info-dialog/info-dialog.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, NgIf, NgFor, MatIconModule, DatePipe],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
    tenants: TenantAdmin[] = [];
    loading = true;

    constructor(
        private adminService: AdminService,
        private router: Router,
        private infoDialogService: InfoDialogService
    ) { }

    ngOnInit(): void {
        this.loadTenants();
    }

    loadTenants() {
        this.loading = true;
        this.adminService.getTenants().subscribe({
            next: (data) => {
                this.tenants = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                if (err.status === 401 || err.status === 403) {
                    this.router.navigate(['/admin/login']);
                }
            }
        });
    }

    get pendingConfigCount(): number {
        return this.tenants.filter(t => !t.completedConfiguration).length;
    }

    deleteTenant(tenant: TenantAdmin) {
        if (confirm(`Tem certeza que deseja excluir o tenant "${tenant.name}"? Esta ação é irreversível e apagará todos os dados associados (agendamentos, profissionais, etc).`)) {
            this.adminService.deleteTenant(tenant.id).subscribe({
                next: () => {
                    this.infoDialogService.showMessage("Tenant excluído com sucesso!", true);
                    this.loadTenants();
                },
                error: (err) => {
                    this.infoDialogService.showMessage("Erro ao excluir tenant.", false);
                }
            });
        }
    }

    copyMagicLink(url: string | undefined) {
        if (!url) {
            this.infoDialogService.showMessage("Link mágico não disponível para este tenant.", false);
            return;
        }
        navigator.clipboard.writeText(url).then(() => {
            this.infoDialogService.showMessage("Link mágico copiado para a área de transferência!", true);
        }).catch(err => {
            this.infoDialogService.showMessage("Falha ao copiar o link.", false);
            console.error('Erro ao copiar', err);
        });
    }

    openWhatsApp(link: string) {
        window.open(link, '_blank');
    }

    logout() {
        localStorage.clear();
        this.router.navigate(['/admin/login']);
    }
}
