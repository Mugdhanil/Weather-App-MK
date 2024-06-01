import { Component, Inject } from '@angular/core';
import { faFaceSmile, faFaceFrown } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../Services/weather.service';

@Component({
  selector: 'app-right-container',
  templateUrl: './right-container.component.html',
  styleUrl: './right-container.component.css'
})
export class RightContainerComponent {

  constructor(public weatherService: WeatherService){};


  //fa icons for smile/frown
  faFaceSmile:any = faFaceSmile;
  faFaceFrown:any = faFaceFrown;


   //functions to control tab values or tab states
   onTodayClick(){
    this.weatherService.today = true;
    this.weatherService.week = false;
   }
   onWeekClick(){
    this.weatherService.week = true; 
    this.weatherService.today = false;
    
   }

   //functions to control metric value
   onCelciusClick(){
    this.weatherService.celcius = true;
    this.weatherService.fahrenheit = false;
   }
   onFahrenheitClick(){
    this.weatherService.fahrenheit = true;
    this.weatherService.celcius = false;
   
   }
}
