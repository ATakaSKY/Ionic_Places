import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Place } from "./places.model";
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';

interface PlaceData {
  availableFrom: string,
  availableTo: string,
  description: string,
  imageUrl: string,
  price: number
  title: string,
  userId: string
}

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New York City.',
//     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
//     149.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     "L'Amour Toujours",
//     'A romantic place in Paris!',
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
//     189.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'def'
//   ),
//   new Place(
//     'p3',
//     'The Foggy Palace',
//     'Not your average city trip!',
//     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
//     99.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'def'
//   )
// ]

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService,
              private http:HttpClient) {}

  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://ionic-places-c5a21.firebaseio.com/places/${id}.json`)
          .pipe(
            map(resData => {
              return new Place(
                id, 
                resData.title,
                resData.description,
                resData.imageUrl,
                resData.price,
                new Date(resData.availableFrom),
                new Date(resData.availableTo),
                resData.userId
                )
            })
          );
  }

  fetchPlaces(){
    return this.http.get<{[key:string] : PlaceData}>('https://ionic-places-c5a21.firebaseio.com/places.json')
      .pipe(map(resData => {
        const places = [];
        for(const key in resData){
          if(resData.hasOwnProperty(key)){
            places.push(new Place(
              key, 
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
            ))
          }
        };
        return places;
      }),
      tap(places => {
        this._places.next(places);
      })
      )
  }

  uploadImage(image:File){
    const imageData = new FormData();
    imageData.append('image', image);

    return this.http.post<{ imagePath:string, imageUrl:string }>('https://us-central1-ionic-places-c5a21.cloudfunctions.net/storeImage',imageData);
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    imageUrl
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      imageUrl,
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    
    let genId:string;

    return this.http.post<{name:string}>('https://ionic-places-c5a21.firebaseio.com/places.json', {...newPlace, id:null})
      .pipe(switchMap( resData => {
        genId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
          newPlace.id = genId;
          this._places.next(places.concat(newPlace));
         }
        )
      )
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces:Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if(places && !places.length){
          return this.fetchPlaces();
        }else{
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(`https://ionic-places-c5a21.firebaseio.com/places/${placeId}.json`,
          {...updatedPlaces[updatedPlaceIndex], id:null}  
        )
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    )
  }
}
