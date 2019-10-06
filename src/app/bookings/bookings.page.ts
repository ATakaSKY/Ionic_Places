import { Component, OnInit } from '@angular/core';
import {Booking} from "./booking.model";
import {BookingService} from "./booking.service";
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedBookings: Booking[];
  private bookingSub: Subscription;
  isLoading = false;

  constructor(private bookingService: BookingService,
              private loadingCtrl:LoadingController) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

  async onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();

    const loading = await this.loadingCtrl.create({
      message: 'Cancelling',
      duration: 1000
    });
    await loading.present();

    this.bookingService.cancelBooking(bookingId).subscribe(() => {
      loading.dismiss();
    });
    // cancel booking wiht id offerId
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

}
