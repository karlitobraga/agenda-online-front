import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IDayWeek {
  id: string;
  tenantId: string;
  day: string;
  start: string; // ex: "08:00"
  end: string;   // ex: "18:00"
  dayOff: boolean;
}

export interface ILunchTime {
  id: string;
  active: boolean;
  start: string;
  end: string;
}

export interface ISpecialDay {
  id?: string;
  tenantId: string;
  date: string; // ISO string for DateTime
  isDayOff: boolean;
  start?: string; // "08:00"
  end?: string;   // "18:00"
}

@Injectable({
  providedIn: 'root'
})
export class DayWeekService {
  baseUrl = environment.apiUrl + '/DayWeek';
  lunchUrl = this.baseUrl + '/Lunch';
  specialUrl = this.baseUrl + '/Special'; // Assuming this is the base URL for special days based on user request

  constructor(private http: HttpClient) { }

  public get(tenantId: string): Observable<IDayWeek[]> {
    return this.http.get<IDayWeek[]>(this.baseUrl + `/${tenantId}`)
  }

  public update(days: IDayWeek[]) {
    return this.http.put(this.baseUrl, days)
  }

  public getLunch(tenantId: string): Observable<ILunchTime> {
    return this.http.get<ILunchTime>(this.lunchUrl + `/${tenantId}`)
  }

  public updateLunch(lunch: ILunchTime) {
    return this.http.put(this.lunchUrl, lunch)
  }

  // Special Days API
  public getSpecialDays(tenantId: string): Observable<ISpecialDay[]> {
    return this.http.get<ISpecialDay[]>(this.specialUrl + `/${tenantId}`);
  }

  public addSpecialDay(specialDay: ISpecialDay) {
    return this.http.post(this.specialUrl, specialDay);
  }

  public updateSpecialDay(id: string, specialDay: ISpecialDay) {
    return this.http.put(this.specialUrl + `/${id}`, specialDay);
  }

  public deleteSpecialDay(id: string) {
    return this.http.delete(this.specialUrl + `/${id}`);
  }
}
