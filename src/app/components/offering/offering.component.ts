import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OfferingService } from './offering.service';
import { IOfferingResponse } from './offering.interface';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent } from './detail/detail.component';
import { Operation } from './detail/detail.enum';
import { DayWeekService, IDayWeek, ILunchTime, ISpecialDay } from './day-week.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { SignupService } from '../signup/signup.service';
import { switchMap } from 'rxjs';
import { EvolutionService } from '../../services/evolution.service';
import { start } from 'node:repl';

@Component({
  selector: 'app-offering',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgFor,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './offering.component.html',
  styleUrls: ['./offering.component.scss']
})
export class OfferingComponent implements OnInit, OnDestroy {
  public operacao: Operation = Operation.Offering;
  public enumOperacao = Operation;
  public offerings: Array<IOfferingResponse> = [];
  public daysWeekForm: FormGroup;
  public lunchForm: FormGroup;
  public specialDayForm: FormGroup;
  public specialDays: ISpecialDay[] = [];
  public qrCodeBase64: string | null = null;
  public loadingQrCode: boolean = false;
  public isConnected: boolean = false;
  public connectionCheckInterval: any;
  public isInitialFlow: boolean = false;

  constructor(
    private offeringService: OfferingService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dayWeekService: DayWeekService,
    private router: Router,
    private signupService: SignupService,
    private evolutionService: EvolutionService,
    private route: ActivatedRoute
  ) {
    this.daysWeekForm = fb.group({
      daysWeek: fb.array([])
    });

    // Formulário do horário de almoço
    this.lunchForm = this.fb.group({
      id: [''],
      active: [true],
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
    });

    // Formulário de dias especiais
    this.specialDayForm = this.fb.group({
      date: ['', [Validators.required]],
      isDayOff: [true],
      start: [''],
      end: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      const flow = params['flow'];

      if (flow === 'initial') {
        this.isInitialFlow = true;
      }

      if (section === 'qrcode') this.operacao = Operation.QrCode;
      else if (section === 'services') this.operacao = Operation.Offering;
      else if (section === 'hours') this.operacao = Operation.DayWeek;
      else if (section === 'holidays') this.operacao = Operation.SpecialDay;

      // If QR Code section is loaded, start loading the code immediately
      if (this.operacao === Operation.QrCode) {
        this.loadQrCode();
      }
    });
    this.getOfferingData();

    this.setupFormSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }

  setupFormSubscriptions() {
    this.specialDayForm.get('isDayOff')?.valueChanges.subscribe(isDayOff => {
      const start = this.specialDayForm.get('start');
      const end = this.specialDayForm.get('end');
      if (isDayOff) {
        start?.clearValidators();
        end?.clearValidators();
        start?.setValue('');
        end?.setValue('');
      } else {
        start?.setValidators([Validators.required]);
        end?.setValidators([Validators.required]);
      }
      start?.updateValueAndValidity();
      end?.updateValueAndValidity();
    });

    // Atualiza validações conforme o estado de "ativo"
    this.lunchForm.get('active')?.valueChanges.subscribe(active => {
      const start = this.lunchForm.get('start');
      const end = this.lunchForm.get('end');

      if (active) {
        start?.setValidators([Validators.required]);
        end?.setValidators([Validators.required]);
      } else {
        start?.clearValidators();
        end?.clearValidators();
      }

      start?.updateValueAndValidity();
      end?.updateValueAndValidity();
    });
  }

  loadInitialData() {
    const tenantID = localStorage.getItem('tenantId') ?? '';

    this.dayWeekService.getLunch(tenantID)
      .subscribe({
        next: result => {
          this.lunchForm.patchValue({
            id: result.id,
            active: result.active,
            start: result.start,
            end: result.end,
          })
        }
      });

    this.dayWeekService.get(tenantID).subscribe(result => this.initDayWeekForm(result));
  }

  get daysWeek(): FormArray {
    return this.daysWeekForm.get('daysWeek') as FormArray;
  }

  public initDayWeekForm(days: IDayWeek[]) {
    const ordemDias = [
      'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
    ];

    days.sort((a, b) => ordemDias.indexOf(a.day) - ordemDias.indexOf(b.day));

    days.forEach(day => {
      const group = this.fb.group({
        id: [day.id],
        tenantId: [day.tenantId],
        day: [day.day],
        start: [day.start],
        end: [day.end],
        dayOff: [day.dayOff]
      });

      // Aplica validações condicionais
      group.get('dayOff')?.valueChanges.subscribe(off => {
        const start = group.get('start');
        const end = group.get('end');
        if (off) {
          start?.clearValidators();
          end?.clearValidators();
        } else {
          start?.setValidators([Validators.required]);
          end?.setValidators([Validators.required]);
        }
        start?.updateValueAndValidity();
        end?.updateValueAndValidity();
      });

      this.daysWeek.push(group);
    });
  }

  public getOfferingData() {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    this.offeringService.GetAll(tenantId).subscribe({
      next: response => (this.offerings = response)
    });
  }

  public openDetail(offering: IOfferingResponse | null = null) {
    let dialog = this.dialog.open(DetailComponent, {
      width: '90vw',
      maxWidth: '90vw',
      data: offering
    });
    dialog.afterClosed().subscribe(() => this.getOfferingData());
  }

  public delete(offering: IOfferingResponse) {
    if (this.offerings.length > 1) {
      this.offeringService.deleteOffering(offering.id).subscribe(() => this.getOfferingData());
    }
  }

  public continue() {
    if (this.operacao === Operation.QrCode) {
      if (!this.isConnected) return;

      if (this.isInitialFlow) {
        // Go to Services
        this.operacao = Operation.Offering;
      } else {
        // Maintenance mode: Save & Exit
        this.router.navigate(['/inicio']);
      }

      // Stop polling when leaving QR
      if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);

    } else if (this.operacao === Operation.Offering) {
      if (this.offerings.length === 0) return;

      this.signupService.updateTenant(localStorage.getItem('tenantId') ?? '', true)
        .subscribe(() => {
          this.router.navigate(['/inicio']);
        });
    }
  }

  public return() {
    if (this.operacao === Operation.Offering) { // Services
      if (this.isInitialFlow) {
        // Should not happen if we disable button, but if it does, go back to QR?
        // User said: "initial flow invalidates return".
        // But if we want to allow re-scanning?
        // Let's stick to user request: "foi possível clicar em anterior e ele retornou para os horários, isso não deveria ser mais possível."
        this.operacao = Operation.QrCode;
        this.loadQrCode();
      } else {
        // Maintenance: Exit to home
        this.router.navigate(['/inicio']);
      }
    } else if (this.operacao === Operation.QrCode) { // WhatsApp
      if (this.isInitialFlow) {
        // Should be disabled
        return;
      }
      this.operacao = Operation.DayWeek;
      if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);
    } else if (this.operacao === Operation.SpecialDay) { // Special Days
      this.operacao = Operation.Offering;
    } else { // DayWeek or others
      this.router.navigate(['/inicio']);
    }
  }

  public saveAndContinue() {
    if (this.daysWeekForm.invalid || this.lunchForm.invalid) {
      this.daysWeekForm.markAllAsTouched();
      this.lunchForm.markAllAsTouched();
      return;
    }

    const payload = this.daysWeek.value as IDayWeek[];

    this.dayWeekService.update(payload)
      .pipe(
        switchMap(() => this.signupService.updateTenant(localStorage.getItem('tenantId') ?? '', true))
      )
      .subscribe(() => {
        this.operacao = Operation.QrCode;
        this.loadQrCode();
      });

    let lunch: ILunchTime = {
      id: this.lunchForm.get('id')?.value,
      active: this.lunchForm.get('active')?.value,
      start: this.lunchForm.get('start')?.value,
      end: this.lunchForm.get('end')?.value
    }

    this.dayWeekService.updateLunch(lunch)
      .subscribe({
        next: _ => { }
      })
  }

  public isValidForms(): boolean {
    return this.daysWeekForm.valid && this.lunchForm.valid;
  }

  // Special Days Logic
  public loadSpecialDays() {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    this.dayWeekService.getSpecialDays(tenantId).subscribe({
      next: (data) => this.specialDays = data,
      error: (err) => console.error('Erro ao carregar dias especiais', err)
    });
  }

  public addSpecialDay() {
    if (this.specialDayForm.invalid) {
      this.specialDayForm.markAllAsTouched();
      return;
    }

    const tenantId = localStorage.getItem('tenantId') ?? '';
    const formValue = this.specialDayForm.value;

    const newSpecialDay: ISpecialDay = {
      tenantId: tenantId,
      date: formValue.date,
      isDayOff: formValue.isDayOff,
      start: formValue.start || null,
      end: formValue.end || null
    };

    this.dayWeekService.addSpecialDay(newSpecialDay).subscribe({
      next: () => {
        this.loadSpecialDays();
        this.specialDayForm.reset({ isDayOff: true });
        // Optional: Add toast notification here
      },
      error: (err) => console.error('Erro ao adicionar dia especial', err)
    });
  }

  public deleteSpecialDay(id: string | undefined) {
    if (!id) return;
    this.dayWeekService.deleteSpecialDay(id).subscribe({
      next: () => this.loadSpecialDays(),
      error: (err) => console.error('Erro ao remover dia especial', err)
    });
  }

  public finish() {
    this.router.navigate(['/inicio']);
  }

  public loadQrCode() {
    this.loadingQrCode = true;
    this.qrCodeBase64 = null;
    this.isConnected = false;

    // Initial check to see if already connected
    this.checkStatus();

    const tenantId = localStorage.getItem('tenantId') ?? '';
    this.evolutionService.getQrCode(tenantId).subscribe({
      next: (res) => {
        // Log for debugging
        console.log('QR Code received from backend:', res.qrcode ? res.qrcode.substring(0, 50) + '...' : 'null');

        let code = res.qrcode;
        if (code && !code.startsWith('data:image')) {
          code = 'data:image/png;base64,' + code;
        }

        this.qrCodeBase64 = code;
        this.loadingQrCode = false;
        // Start polling
        this.startPolling();
      },
      error: (err) => {
        console.error('Erro ao carregar QR Code', err);
        this.loadingQrCode = false;
      }
    });
  }

  public startPolling() {
    if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);
    this.connectionCheckInterval = setInterval(() => {
      this.checkStatus();
    }, 3000); // Check every 3 seconds
  }

  public checkStatus() {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    this.evolutionService.checkConnectionStatus(tenantId).subscribe({
      next: (res) => {
        if (res.connected) {
          this.isConnected = true;
          this.qrCodeBase64 = null; // Hide QR if connected
          if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);
        }
      },
      error: () => { /* ignore errors during polling */ }
    });
  }

  public continueFromQrCode() {
    // This is called from the button directly
    this.continue();
  }
}
