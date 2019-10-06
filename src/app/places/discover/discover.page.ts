import { Component, OnInit } from '@angular/core';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isPlacesLoading:boolean = false;
  private placesSub: Subscription;
  private filter = 'all';

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService:AuthService
  ) {}

  ngOnInit() {
    console.log('onInit');
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
      // this.relevantPlaces = this.loadedPlaces;
      // this.listedLoadedPlaces = this.loadedPlaces.slice(1);
    });
  }

  ionViewWillEnter(){
    this.isPlacesLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isPlacesLoading = false;
    });
  }

  onFilterUpdate(filter: string) {
    const isShown = place => filter === 'all' || place.userId !== this.authService.userId;
    this.relevantPlaces = this.loadedPlaces.filter(isShown);
    this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    this.filter = filter;
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
