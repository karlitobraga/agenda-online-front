import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IOfferingResponse } from '../offering.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { OfferingService } from '../offering.service';
import { Operation } from './detail.enum';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, CommonModule, NgxMaskDirective],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  public editMode: boolean = false;
  public formGroup: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<IOfferingResponse>,
    @Inject(MAT_DIALOG_DATA) public data: IOfferingResponse,
    private offeringService: OfferingService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      name: [data?.name ?? '', [Validators.required]],
      duration: [data?.executionTime ?? 0, [Validators.required, Validators.min(0)]],
      price: [data?.price ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  get isEditMode(): boolean {
    return this.data != null && this.data != undefined;
  }

  public salvar() {
    let offer: IOfferingResponse = {
      id: this.data?.id ?? 0,
      tenantId: localStorage.getItem("tenantId") ?? '',
      name: this.formGroup.get('name')?.value,
      executionTime: this.formGroup.get('duration')?.value,
      price: this.formGroup.get('price')?.value
    }

    if(this.data?.id == null)
      this.offeringService.insertOferring(offer)
      .subscribe({
        next: result => this.dialogRef.close()
      })
    else
      this.offeringService.updateOffering(offer)
        .subscribe({
          next: result => this.dialogRef.close()
        })
  }
}
