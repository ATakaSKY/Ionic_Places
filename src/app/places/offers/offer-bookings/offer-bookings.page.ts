import { Component, OnInit } from '@angular/core';
import { Place } from '../../places.model';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from '../../places.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit {
  place:Place;

  constructor(
    private route:ActivatedRoute,
    private service:PlacesService,
    private navCtrl:NavController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(param => {
      if(!param.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/offers');
      }
      this.place = this.service.find(param.get('placeId'));
    })
  }

}
