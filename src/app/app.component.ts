import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private chartData: Array<any>;
  private chartData2: Array<any>;

  ngOnInit() {
    // give everything a chance to get loaded before starting the animation to reduce choppiness
    setTimeout(() => {
      this.generateData();

      // change the data periodically
      setInterval(() => this.generateData(), 3000);

    }, 1000);
  }

  constructor() { }

  generateData(): void {
    this.chartData = [];
    this.chartData2 = [];

    for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
      this.chartData.push([
        `Index ${i}`,
        Math.floor(Math.random() * 100)
      ]);
    }

    for (let i = 0; i < (20 + Math.floor(Math.random() * 20)); i++) {
      this.chartData2.push([
        `Index ${i}`,
        Math.floor(Math.random() * 200)
      ]);
    }

  }

}
