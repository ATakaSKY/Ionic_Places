import { Component, OnInit, Input } from '@angular/core';
import { Place } from '../../places/places.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;

  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {}

  onBookPlace(){
    this.modalCtrl.dismiss({message: 'the place has been booked'}, 'confirm');
  }

  onCancel(){
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
