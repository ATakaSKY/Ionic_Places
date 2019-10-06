import { Component, OnInit } from '@angular/core';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
  isPlacesLoading:boolean = false;
  places:Place[];
  private placesSub: Subscription;
  
  constructor(private placesService:PlacesService,
              private router:Router) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.places = places;
    });
  }

  ionViewWillEnter(){
    this.isPlacesLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isPlacesLoading = false;
    });
  }

  onEdit(offerId, slidingItem:IonItemSliding){
    console.log(offerId);
    this.router.navigate(['/','places','tabs','offers','edit',offerId]);
    slidingItem.close();
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
