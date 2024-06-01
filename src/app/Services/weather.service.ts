import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocationDetails } from '../Models/LocationDetails';
import { WeatherDetails } from '../Models/WeatherDetails';
import { TemperatureData } from '../Models/TemperatureData';
import { TodayData } from '../Models/TodayData';
import { WeekData } from '../Models/WeekData';
import { TodaysHighlights } from '../Models/TodaysHighlights';
import { EnvironmentVariables } from '../Environment/EnvironmentVariables';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  locationDetails?: LocationDetails;
  weatherDetails?: WeatherDetails;
  temperatureData: TemperatureData = new TemperatureData(); // Left-Container Data
  todayData: TodayData[] = []; // Right-Container Data
  weekData: WeekData[] = []; // Right-Container Data
  todaysHighlights: TodaysHighlights = new TodaysHighlights(); // Right-Container Data

  //Variables to hold city name, language and units
  cityName: string = "New Delhi";
  lang: string = "en";
  units: string = "metric";
  date: string = "31052024";

  //Variables holding current time
  currentTime: Date;

  //Variables to control tabs
  today:boolean = false;
  week:boolean = true;
 
  //variables to control metric value
   celcius:boolean = true;
   fahrenheit:boolean = false;

  constructor(private httpClient: HttpClient) {
    this.getData();
  }

  getSummaryImage(summary: string): string {
    const baseAddress = "../../assets/";
    const images = {
      "Cloudy": "cloud.gif",
      "Cloud": "cloud.gif",
      "Overcast": "cloud.gif",
      "Partly Cloudy": "partly-cloudy.gif",
      "Partly cloudy": "partly-cloudy.gif",
      "Heavy Rain": "heavy-rain.gif",
      "Light Rain": "light-rain.gif",
      "Light rain shower": "light-rain.gif",
      "Patchy rain nearby": "light-rain.gif",
      "Patchy light drizzle": "light-rain.gif",
      "Light Snow": "light-snow.gif",
      "Rain": "rain.gif",
      "Moderate or heavy rain shower": "rain.gif",
      "Rain Cloud": "rain-cloud.gif",
      "Snow": "snow.gif",
      "Clear": "sun.gif",
      "Sun": "sun.gif",
      "Sunny": "sun.gif",
      "Frost": "frost.gif",
      "Thunderstorm": "thunderstorm.gif",
      "Thundery outbreaks in nearby": "thunderstorm.gif",
      "Thundery outbreaks possible": "thunderstorm.gif",
      "Night": "night.gif",
      "Fog": "fog.gif",
      "Mist": "fog.gif",
      "Wind": "wind.gif",
    };

    for (const key in images) {
      if (summary.includes(key)) {
        return baseAddress + images[key];
      }
      else if(summary.includes("Mist")){
        return baseAddress + images["Mist"];
      }
      else if(summary.includes("Partly Cloudy" || "Partly cloudy")){
        return baseAddress + images["Partly cloudy"];
      }
    }
    return baseAddress + images["Partly cloudy"];
  }

  fillTemperatureData() {
    if (this.weatherDetails && this.weatherDetails.current) {
      this.currentTime = new Date();
      this.temperatureData.day = this.currentTime.toLocaleDateString('en-US', { weekday: 'long' });
      this.temperatureData.time = `${String(this.currentTime.getHours()).padStart(2, "0")}:${String(this.currentTime.getMinutes()).padStart(2, "0")}`;
      this.temperatureData.temperature = this.weatherDetails.current.temp_c;
      this.temperatureData.location = `${this.locationDetails?.name}, ${this.locationDetails?.country}`;
      this.temperatureData.rainPercent = this.weatherDetails.current.precip_mm;
      this.temperatureData.summaryPhrase = this.weatherDetails.current.condition.text;
      this.temperatureData.summaryImage = this.getSummaryImage(this.temperatureData.summaryPhrase);
    } else {
      console.error('Weather details or current observation data is undefined');
    }
  }

  fillWeekData() {
    if (this.weatherDetails && this.weatherDetails.forecast) {
      this.weekData = this.weatherDetails.forecast.forecastday.map((day) => {
        const weekData = new WeekData();
        weekData.day = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        weekData.tempMax = day.day.maxtemp_c;
        weekData.tempMin = day.day.mintemp_c;
        weekData.summaryImage = this.getSummaryImage(day.day.condition.text);
        weekData.summaryPhrase = this.weatherDetails.current.condition.text;
        return weekData;
      });
    } else {
      console.error('Weather details or daily forecast data is undefined');
    }
  }

  fillTodayData() {
    if (this.weatherDetails && this.weatherDetails.forecast) {
      const today = this.weatherDetails.forecast.forecastday[0];
      this.todayData = today.hour.map((hour) => {
        const todayData = new TodayData();
        todayData.time = hour.time.split(' ')[1];
        todayData.temperature = hour.temp_c; // Ensure the temperature is a number
        todayData.summaryImage = this.getSummaryImage(hour.condition.text);
        todayData.summary = hour.condition.text;
        return todayData; // Ensure each mapped hour returns a TodayData object
      }).slice(0, 7); // Get only the first 7 hours of today
    } else {
      console.error('Weather details or hourly forecast data is undefined');
    }
  }

  calculateAQI(pollutants: any): number {
    // Define AQI ranges and corresponding pollutant concentration ranges
    const AQIRanges = [
      { low: 0, high: 50, category: 'Good' },
      { low: 51, high: 100, category: 'Moderate' },
      // Add more ranges as needed...
    ];

    // Calculate AQI for each pollutant
    const AQIs = Object.keys(pollutants).map((key) => {
      const concentration = pollutants[key];
      // Use appropriate AQI calculation method for each pollutant
      // For simplicity, let's assume a linear formula for demonstration
      // You should replace this with the actual calculation method
      const AQI = concentration * 100 / 500;
      return AQI;
    });

    // Select maximum AQI
    const maxAQI = Math.max(...AQIs);

    // Find corresponding AQI range
    const range = AQIRanges.find((range) => maxAQI >= range.low && maxAQI <= range.high);

    // Log AQI category
    if (range) {
      console.log('AQI Category:', range.category);
    } else {
      console.log('AQI Category not found for AQI:', maxAQI);
    }

    return maxAQI;
  }
  fillTodaysHighlights() {
    if (this.weatherDetails && this.weatherDetails.current && this.weatherDetails.forecast) {
      const today = this.weatherDetails.forecast.forecastday[0];
  
      this.todaysHighlights.uvIndex = today.day.uv;
      this.todaysHighlights.windStatus = this.weatherDetails.current.wind_kph;
      this.todaysHighlights.summaryPhrase = this.weatherDetails.current.condition.text;
      this.todaysHighlights.rainPercent = this.weatherDetails.current.precip_mm;
      this.todaysHighlights.location = `${this.locationDetails?.name}, ${this.locationDetails?.country}`;
      this.todaysHighlights.sunrise = today.astro.sunrise;
      this.todaysHighlights.sunset = today.astro.sunset;
      this.todaysHighlights.humidity = this.weatherDetails.current.humidity;
      this.todaysHighlights.visibility = this.weatherDetails.current.vis_km;
      this.todaysHighlights.air_quality = this.calculateAQI(this.weatherDetails.current.air_quality).toFixed(2);
      
    } else {
      console.error('Weather details or highlight data is undefined');
    }
  }

  


  prepareData(): void {
    this.fillTemperatureData();
    this.fillWeekData();
    this.fillTodayData();
    this.fillTodaysHighlights();
    console.log(this.todayData);
    console.log(this.weekData);
    console.log(this.temperatureData);
    console.log(this.todaysHighlights);
    console.log(this.weatherDetails);
  }

celciusToFarenheit(temp: number): number {
  return +((temp * 9/5) + 32).toFixed(2);
}
fehrenheitToCelcius(temp: number): number {
  return +((temp - 32) * 5/9).toFixed(2);
}

  getLocationDetails(cityName: string): Observable<LocationDetails[]> {
    return this.httpClient.get<LocationDetails[]>(EnvironmentVariables.weatherApiLocationUrl, {
      headers: new HttpHeaders().set('key', EnvironmentVariables.ApiKeyValue),
      params: new HttpParams().set('q', cityName)
    });
  }

  getWeatherReport(lat: number, lon: number): Observable<WeatherDetails> {
    return this.httpClient.get<WeatherDetails>(EnvironmentVariables.weatherApiForecastUrl, {
      headers: new HttpHeaders().set('key', EnvironmentVariables.ApiKeyValue),
      params: new HttpParams()
        .set('q', `${lat},${lon}`)
        .set('days', '7')
        .set('aqi', 'yes')
        .set('alerts', 'no')
    }).pipe(
      map(response => {
        console.log('Weather Report Response:', response); // Log the entire response
        return response;
      })
    );
  }

  getData() {
    this.getLocationDetails(this.cityName).subscribe({
      next: (locationResponse) => {
        if (locationResponse.length > 0) {
          this.locationDetails = locationResponse[0];
          const lat = this.locationDetails.lat;
          const lon = this.locationDetails.lon;

          this.getWeatherReport(lat, lon).subscribe({
            next: (weatherResponse) => {
              this.weatherDetails = weatherResponse;
              this.prepareData();
            },
            error: (err) => console.error('Error fetching weather report:', err)
          });
        } else {
          console.error('No location data found');
        }
      },
      error: (err) => console.error('Error fetching location details:', err)
    });
  }
}
