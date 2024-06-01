import { Component } from '@angular/core';
import { faMagnifyingGlass, faLocation, faCloud, faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../Services/weather.service';
@Component({
  selector: 'app-left-container',
  templateUrl: './left-container.component.html',
  styleUrl: './left-container.component.css'
})
export class LeftContainerComponent {

  //variables for Font Awesome icons
  //variables for Left Nav Bar icons
  faMagnifyingGlass:any = faMagnifyingGlass;
  faLocation:any = faLocation;

  //Variables for Temperature Summary
  faCloud:any = faCloud;
  faCloudRain:any = faCloudRain;


  constructor(public weatherService:WeatherService){}

  onSearch(location:string){
    this.weatherService.cityName = location;
    this.weatherService.getData();
    
  }
}
