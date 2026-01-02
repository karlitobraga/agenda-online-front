import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface InfoDialogData {
  message: string,
  success: boolean
}


@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [NgClass, CommonModule, MatDialogModule],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InfoDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData
  ) {

  }
}
