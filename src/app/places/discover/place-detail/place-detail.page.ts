import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { switchMap, take } from 'rxjs/operators';
  
@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;
  private placeSub: Subscription;
  isBookable=false;
  isPlaceLoading:boolean = false;

  constructor(
    private route:ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl:NavController,
    private modalCtrl:ModalController,
    private actionSheetController: ActionSheetController,
    private loadingCtrl:LoadingController,
    private bookingService:BookingService,
    private authService:AuthService,
    private alertCtrl:AlertController,
    private router:Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/discover');
      }
      this.isPlaceLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
          if (!userId) {
            throw new Error('Found no user!');
          }
          fetchedUserId = userId;
          return this.placesService.getPlace(paramMap.get('placeId'));
        })
      )
      .subscribe(place => {
          this.place = place;
          this.isBookable = place.userId !== fetchedUserId;
          this.isPlaceLoading = false;
        }, error => {
          this.alertCtrl.create({
            header: 'An error occured',
            message: 'Could not load place.',
            buttons: [{text:'Okay', handler: () => {
              this.router.navigate(['places/tabs/discover']);
            }}]
          }).then(alertEl => {
            alertEl.present();
          })
        });
    })
  }
  
  async onBookPlace(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an action',
      buttons: [{
        text: 'Select date',
        handler: () => {
          this.openBookingModal('select');
        }
      }, {
        text: 'Random date',
        handler: () => {
          this.openBookingModal('random');
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
    
  }

  openBookingModal(mode: 'select' | 'random'){
    this.modalCtrl
      .create({
        component:CreateBookingComponent,
        componentProps: {selectedPlace:this.place, mode}
      })
      .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingCtrl
          .create({ message: 'Booking place...' })
          .then(loadingEl => {
            loadingEl.present();
            const data = resultData.data.bookingData;
            this.bookingService
              .addBooking(
                this.place.id,
                this.place.title,
                this.place.imageUrl,
                data.firstName,
                data.lastName,
                data.guestNumber,
                data.startDate,
                data.endDate
              )
              .subscribe(() => {
                loadingEl.dismiss();
              });
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
