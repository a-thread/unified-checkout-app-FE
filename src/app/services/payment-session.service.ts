import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentSessionService {
  private apiUrl = `${environment.apiUrl}/Payment`

  constructor(private http: HttpClient) {}

  createSession(): Observable<any> {
    const payload = {
      targetOrigins: ["https://www.example.com"],
      allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX"],
      clientVersion: "v2.0"
    };
    return this.http.post<any>(
      `${this.apiUrl}/create-session`,
      payload);
  }
}
