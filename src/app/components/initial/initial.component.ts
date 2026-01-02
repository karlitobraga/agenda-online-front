import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { InfoDialogService } from '../shared/info-dialog/info-dialog.service';
import { ScheduleService, ISchedule } from '../../services/schedule.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { OfferingService } from '../offering/offering.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ManualBookingComponent } from './manual-booking/manual-booking.component';
import { SubscriptionModalComponent } from '../shared/subscription-modal/subscription-modal.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './initial.component.html',
  styleUrl: './initial.component.scss',
  providers: [DatePipe]
})
export class InitialComponent implements OnInit {
  public schedules: ISchedule[] = [];
  public selectedDate: Date = new Date();
  public tenantId: string = '';
  public tenantSlug: string = '';
  public bookingUrl: string = '';

  public showConfigWarning: boolean = false;
  public missingServices: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private dialogService: InfoDialogService,
    private scheduleService: ScheduleService,
    private datePipe: DatePipe,
    private offeringService: OfferingService,
    private dialog: MatDialog
  ) {
    this.tenantId = localStorage.getItem("tenantId") ?? '';

    if (this.tenantId === '' || this.tenantId === undefined) {
      localStorage.removeItem('token')
      localStorage.removeItem('tenantId')
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.checkConfiguration();
    this.loadSchedules();
    this.loadTenantInfo();

    // Refresh every 1 hour (3600000 ms)
    setInterval(() => {
      this.loadSchedules();
    }, 3600000);

    this.checkSubscription();
  }

  checkSubscription() {
    const status = localStorage.getItem('subscriptionStatus');
    if (status === 'EXPIRED') {
      this.dialog.open(SubscriptionModalComponent, {
        width: '450px',
        disableClose: true,
        panelClass: 'subscription-dialog'
      });
    }
  }

  loadTenantInfo() {
    this.loginService.getTenant(this.tenantId).subscribe({
      next: response => {
        if (response && response.slug) {
          this.tenantSlug = response.slug;
          this.bookingUrl = `${window.location.origin}/agendar/${this.tenantSlug}`;

          // Calculate live subscription status
          const now = new Date();
          let status = 'EXPIRED';
          if (response.subscriptionExpiryDate && new Date(response.subscriptionExpiryDate) > now) {
            status = 'ACTIVE';
          } else if (response.createdAt && new Date(response.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 > now.getTime()) {
            status = 'TRIAL';
          }

          localStorage.setItem('subscriptionStatus', status);

          // Trigger subscription check with fresh data
          if (status === 'EXPIRED') {
            this.dialog.open(SubscriptionModalComponent, {
              width: '450px',
              disableClose: true,
              panelClass: 'subscription-dialog'
            });
          }
        }
      }
    });
  }

  checkConfiguration() {
    // Only check for services now (WhatsApp removed)
    this.offeringService.GetAll(this.tenantId).subscribe({
      next: (offerings) => {
        const hasServices = offerings && offerings.length > 0;
        if (!hasServices) {
          this.missingServices = true;
          this.showConfigWarning = true;
          // Redirect to Welcome if services not configured
          this.router.navigate(['/welcome']);
        }
      },
      error: () => {
        this.missingServices = true;
        this.showConfigWarning = true;
      }
    });
  }

  loadSchedules() {
    const formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') ?? '';
    this.scheduleService.getByDate(this.tenantId, formattedDate).subscribe({
      next: (data) => {
        this.schedules = data;
        // Sort by time
        this.schedules.sort((a, b) => a.date.localeCompare(b.date));
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos', err);
      }
    });
  }

  // Calculate total price for a schedule
  getSchedulePrice(schedule: ISchedule): number {
    return schedule.offerings?.reduce((sum, off) => sum + (off.price || 0), 0) ?? 0;
  }

  // Calculate total duration for a schedule
  getScheduleDuration(schedule: ISchedule): number {
    return schedule.offerings?.reduce((sum, off) => sum + (off.executionTime || 0), 0) ?? 0;
  }

  onDateChange(event: any) {
    this.selectedDate = event.value;
    this.loadSchedules();
  }

  goToConfiguration() {
    this.router.navigate(['/setup']);
  }

  goToSettings(section: string) {
    this.router.navigate([`/settings/${section}`]);
  }

  copyBookingLink() {
    navigator.clipboard.writeText(this.bookingUrl).then(() => {
      this.dialogService.showMessage('Link copiado para a área de transferência!', true);
    }).catch(() => {
      this.dialogService.showMessage('Erro ao copiar link', false);
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    this.router.navigate(['/login']);
  }

  openBookingModal() {
    const dialogRef = this.dialog.open(ManualBookingComponent, {
      width: '600px', // Increased width for better slot display
      data: {
        tenantId: this.tenantId,
        slug: this.tenantSlug
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSchedules();
        this.dialogService.showMessage('Agendamento criado com sucesso!', true);
      }
    });
  }

  deleteSchedule(schedule: ISchedule) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Excluir Agendamento',
        message: 'Deseja realmente excluir este agendamento? Esta ação não pode ser desfeita.',
        confirmText: 'Excluir',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.delete(schedule.id).subscribe({
          next: () => {
            this.loadSchedules();
            this.dialogService.showMessage('Agendamento excluído com sucesso!', true);
          },
          error: (err) => this.dialogService.showMessage('Erro ao excluir agendamento', false)
        });
      }
    });
  }

  completeSchedule(schedule: ISchedule) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Concluir Atendimento',
        message: `Deseja marcar o agendamento de ${schedule.clientName || 'Cliente'} como concluído?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.markAsCompleted(schedule.id).subscribe({
          next: () => {
            this.loadSchedules();
            this.dialogService.showMessage('Agendamento concluído!', true);
          },
          error: (err) => this.dialogService.showMessage('Erro ao atualizar agendamento', false)
        });
      }
    });
  }
}
