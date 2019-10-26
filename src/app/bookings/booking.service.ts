import { Injectable } from '@angular/core';

import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { environment } from "../../environments/environment";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
  _id:string
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedUserId: string;

    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(
          null,
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
    return this.http.post<{message:string, bookingId:string}>(`${environment.apiUrl}/booking/addBooking`,
      {...newBooking}
      );
        }),
      switchMap( resData => {
        generatedId = resData.bookingId;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
         }
        )
      );
  }

  fetchBookings() {
    debugger;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http
          .get<{bookings : [BookingData]}>(
            `${environment.apiUrl}/booking/bookings?userId=${fetchedUserId}`
          );
      }),
        map(bookingData => {
          const bookings = [];
          for (const booking of bookingData.bookings) {
              bookings.push(
                new Booking(
                  booking._id,
                  booking.placeId,
                  booking.userId,
                  booking.placeTitle,
                  booking.placeImage,
                  booking.firstName,
                  booking.lastName,
                  booking.guestNumber,
                  new Date(booking.bookedFrom),
                  new Date(booking.bookedTo)
                )
              );
          }
          return bookings;
        }),
        tap(bookings => {
          this._bookings.next(bookings);
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
    return this.http
      .delete(
        `${environment.apiUrl}/booking/delete/${bookingId}`
       )
      }),
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
      );
  }

  constructor(private authService: AuthService,
              private http:HttpClient) {}

  // addBooking(
  //   placeId: string,
  //   placeTitle: string,
  //   placeImage: string,
  //   firstName: string,
  //   lastName: string,
  //   guestNumber: number,
  //   dateFrom: Date,
  //   dateTo: Date
  // ) {
  //   let generatedId: string;
  //   let newBooking: Booking;
  //   let fetchedUserId: string;

  //   return this.authService.userId.pipe(
  //     take(1),
  //     switchMap(userId => {
  //       if (!userId) {
  //         throw new Error('No user id found!');
  //       }
  //       fetchedUserId = userId;
  //       return this.authService.token;
  //     }),
  //     take(1),
  //     switchMap(token => {
  //       newBooking = new Booking(
  //         Math.random().toString(),
  //         placeId,
  //         fetchedUserId,
  //         placeTitle,
  //         placeImage,
  //         firstName,
  //         lastName,
  //         guestNumber,
  //         dateFrom,
  //         dateTo
  //       );
  //   return this.http.post<{name:string}>(`https://ionic-places-c5a21.firebaseio.com/bookings.json?auth=${token}`,
  //     {...newBooking, id:null}
  //     );
  //       }),
  //     switchMap( resData => {
  //       generatedId = resData.name;
  //       return this.bookings;
  //     }),
  //     take(1),
  //     tap(bookings => {
  //         newBooking.id = generatedId;
  //         this._bookings.next(bookings.concat(newBooking));
  //        }
  //       )
  //     );
  // }

  // cancelBooking(bookingId: string) {
  //   return this.authService.token.pipe(
  //     take(1),
  //     switchMap(token => {
  //   return this.http
  //     .delete(
  //       `https://ionic-places-c5a21.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
  //      )
  //     }),
  //       switchMap(() => {
  //         return this.bookings;
  //       }),
  //       take(1),
  //       tap(bookings => {
  //         this._bookings.next(bookings.filter(b => b.id !== bookingId));
  //       })
  //     );
  // }

  // fetchBookings() {
  //   let fetchedUserId: string;
  //   return this.authService.userId.pipe(
  //     take(1),
  //     switchMap(userId => {
  //       if (!userId) {
  //         throw new Error('User not found!');
  //       }
  //       fetchedUserId = userId;
  //       return this.authService.token;
  //     }),
  //     take(1),
  //     switchMap(token => {
  //       return this.http
  //         .get<{ [key: string]: BookingData }>(
  //           `https://ionic-places-c5a21.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
  //             fetchedUserId
  //           }"&auth=${token}`
  //         );
  //     }),
  //       map(bookingData => {
  //         const bookings = [];
  //         for (const key in bookingData) {
  //           if (bookingData.hasOwnProperty(key)) {
  //             bookings.push(
  //               new Booking(
  //                 key,
  //                 bookingData[key].placeId,
  //                 bookingData[key].userId,
  //                 bookingData[key].placeTitle,
  //                 bookingData[key].placeImage,
  //                 bookingData[key].firstName,
  //                 bookingData[key].lastName,
  //                 bookingData[key].guestNumber,
  //                 new Date(bookingData[key].bookedFrom),
  //                 new Date(bookingData[key].bookedTo)
  //               )
  //             );
  //           }
  //         }
  //         return bookings;
  //       }),
  //       tap(bookings => {
  //         this._bookings.next(bookings);
  //       })
  //     );
  // }
}
