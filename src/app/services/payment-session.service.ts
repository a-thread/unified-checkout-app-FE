import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { CaptureContext } from '../models/capture-context';

@Injectable({
  providedIn: 'root'
})
export class PaymentSessionService {

  private apiUrl = `${environment.apiUrl}/Payment`

  constructor(private http: HttpClient) { }

  createSession(
    targetOrigins: string[] = ["https://www.example.com"],
    allowedCardNetworks: string[] =  ["VISA", "MASTERCARD", "AMEX"],
  ): Observable<CaptureContext> {
    const payload = {
      targetOrigins,
      allowedCardNetworks,
      clientVersion: "v2.0"
    };
    return this.http.post<any>(
      `${this.apiUrl}/create-session`,
      payload
    ).pipe(
      map(response => {
        const captureContext = JSON.parse(atob(response.captureContext)) as CaptureContext;
        return captureContext;
      })
    );
  }

  processPayment(transientToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process-payment`, { transientToken });
  }
}
