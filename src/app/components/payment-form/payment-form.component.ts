import { Component, OnInit } from '@angular/core';
import { PaymentSessionService } from '../../services/payment-session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptureContext } from '../../models/capture-context';

declare var Accept: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PaymentSessionService],
})
export class PaymentFormComponent implements OnInit {

  constructor(private paymentSessionService: PaymentSessionService) {}

  ngOnInit(): void {
    // create new session as soon as we load the component
    this.createPaymentSession();
  }

  createPaymentSession(): void {
    this.paymentSessionService.createSession().subscribe({
      next: (captureContext) => {
        // dynamically loading the javascript libary
        this.loadClientLibrary(captureContext);
      },
      error: (error) => {
        console.error('Error creating payment session:', error);
      },
    });
  }

  loadClientLibrary(captureContext: CaptureContext): void {
    const script = document.createElement('script');
    script.src = captureContext?.clientLibrary || '';
    // if we load the clientLibrary successfully
    script.onload = () => {
      console.log('clientLibrary loaded successfully');
      // we can load the embedded UI
      this.loadEmbeddedComponent(captureContext);
    };
    script.onerror = () => {
      console.error('Failed to load clientLibrary');
    };
    document.head.appendChild(script);
  }

  loadEmbeddedComponent(captureContext: CaptureContext): void {
    if (typeof Accept !== 'undefined') {
      Accept(captureContext)
        .then((accept: any) => accept.unifiedPayments())
        .then((up: any) =>
          up.show({
            containers: {
              paymentSelection: '#buttonPaymentListContainer',
              paymentScreen: '#embeddedPaymentContainer',
            },
          })
        )
        .then((tt: string) => this.sendSecureInfoToBE(tt))
        .catch((error: any) => {
          alert('Something went wrong: ' + error.message);
        });
    } else {
      console.error('Accept is not defined');
    }
  }

  sendSecureInfoToBE(transientToken: string): void {
    this.paymentSessionService.processPayment(transientToken).subscribe({
      next: (response) => {
        console.log('Payment processed successfully:', response);
      },
      error: (error) => {
        console.error('Error processing payment:', error);
      },
    });
  }
}
