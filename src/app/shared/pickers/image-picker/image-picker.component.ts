import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Input } from '@angular/core';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker',{static:false}) filePickerRef:ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  selectedImage: string;
  usePicker:boolean = false;

  constructor(private platform:Platform) {}

  ngOnInit() {
    console.log('Mobile', this.platform.is('mobile'));
    console.log('ios', this.platform.is('ios'));
    console.log('android', this.platform.is('android'));
    console.log('hybrid', this.platform.is('hybrid'));
    console.log('web', this.platform.is('desktop'));

    if((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
        this.platform.is('desktop')){
          this.usePicker = true;
        }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
     this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.Base64
    })
      .then(image => {
        this.selectedImage = `data:image/jpeg;base64,${image.base64String}`;
        this.imagePick.emit(image.base64String);
      })
      .catch(error => {
        console.log(error);
        if(this.usePicker){
          this.filePickerRef.nativeElement.click();
        }
        return false;
      });
  }

  onFileSelect(event:Event){
    const filePicked = (event.target as HTMLInputElement).files[0];

    if(!filePicked){
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(filePicked);
    }
    fr.readAsDataURL(filePicked);

  }

}