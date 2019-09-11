import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
  
@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;

  constructor(
    private route:ActivatedRoute,
    private service:PlacesService,
    private navCtrl:NavController,
    private modalCtrl:ModalController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(param => {
      if(!param.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/discover');
      }
      this.place = this.service.find(param.get('placeId'));
    })
  }
  
  onBookPlace(){
    this.modalCtrl
      .create({
        component:CreateBookingComponent,
        componentProps: {selectedPlace:this.place}
      })
      .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      console.log(resultData.data);
    });
  }

}
