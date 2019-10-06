import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit {
  @ViewChild('map', {static:false}) mapElRef:ElementRef;

  constructor(private modalCtrl:ModalController,
              private renderer:Renderer2) { }

  ngOnInit() {}

  onCancel(){
    this.modalCtrl.dismiss();
  }

  ngAfterViewInit(){
    this.getGoogleMaps().then((googleMaps) => {
      const mapEl = this.mapElRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center:{ lat:-27.244863, lng:143.173457 },
        zoom:8
      });

      googleMaps.event.addListenerOnce(map, 'idle',() => {
        this.renderer.addClass(mapEl, 'visible');
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  private getGoogleMaps():Promise<any>{
    const win = window as any;
    const googleModule = win.google;
    if(googleModule && googleModule.maps){
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCTJD4846JnqopsplBsAzNa3bSqhORn9AQ&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if(loadedGoogleModule && loadedGoogleModule.maps){
          resolve(loadedGoogleModule.maps);
        }else{
          reject('Could not load maps.');
        }
      }
    })
  }

}
