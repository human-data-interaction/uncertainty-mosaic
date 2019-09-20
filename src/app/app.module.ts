import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { BarChartComponent } from './shared/bar-chart/bar-chart.component';
import { TimeLineComponent } from './shared/time-line/time-line.component';
import { SetCubeComponent } from './shared/set-cube/set-cube.component';
import { TimelineZoomComponent } from './shared/timeline-zoom/timeline-zoom.component';
import { MapBoxComponent } from './shared/map-box/map-box.component';


@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    TimeLineComponent,
    SetCubeComponent,
    TimelineZoomComponent,
    MapBoxComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
