import { Component, OnInit } from '@angular/core';
import { SETDATA, DataManager } from '../datamanager';

@Component({
  selector: 'app-set-cube',
  templateUrl: './set-cube.component.html',
  styleUrls: ['./set-cube.component.css']
})
export class SetCubeComponent implements OnInit {
  private data: Array<any>;
  private dm: DataManager;

  constructor() {
    this.dm = new DataManager( 'goal.com', 'chelsea' );
  }

  ngOnInit() {
    const tesData = this.dm.getSpreadSheet();
    console.log(tesData);
  }

}
