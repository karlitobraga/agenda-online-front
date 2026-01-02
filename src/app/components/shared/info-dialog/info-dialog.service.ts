import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent, InfoDialogData }  from './info-dialog.component'

@Injectable({
  providedIn: 'root'
})
export class InfoDialogService {

  constructor(private dialog: MatDialog) { }

  public showMessage(message: string, success: boolean) {
    const data: InfoDialogData = {
      message,
      success
    }

    this.dialog.open(InfoDialogComponent, {data})
  }
}
