import { Component, OnInit } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import * as moment from 'moment';
// import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit {
  // private map: mapboxgl.Map;
  // private mapCenter: { lat: number, lng: number };

  constructor() {
    // https://stackoverflow.com/questions/44332290/mapbox-gl-typing-wont-allow-accesstoken-assignment
    // mapboxgl.accessToken = environment.MAPBOX_KEY;
    // (mapboxgl as typeof mapboxgl).accessToken = environment.MAPBOX_KEY;
  }

  ngOnInit() {
  }

}
