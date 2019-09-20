import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import d3 = require('d3');
import { SP500_MISSING } from '../datamanager';

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.css']
})
export class TimeLineComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private margin: any = { top: 20, bottom: 0, left: 20, right: 20 };
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private line: d3.Line<[number, number]>;


  constructor() { }

  ngOnInit() {
    this.createChart();
    if (this.data) {
      this.updateChart();
    }
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  createChart(): void {
    const STOCKS = SP500_MISSING;
    const element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left + this.margin.right;
    this.height = element.offsetHeight - this.margin.top + this.margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('height', element.offsetHeight + 20)
      .attr('width', element.offsetWidth);

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define x and y domains
    const xDomain = d3.extent(STOCKS, (d) => d.date);
    const yDomain = d3.extent(STOCKS, (d) => d.value);

    // create scales
    this.xScale = d3.scaleTime().domain(xDomain).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.height + this.margin.top})`)
      .call(d3.axisBottom(this.xScale));

    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');

    // draw line
    this.line = d3.line()
      .x((d: any) => this.xScale(d.date))
      .y((d: any) => this.yScale(d.value));

    this.chart.append('path')
      .datum(STOCKS)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'blue');

  }

  updateChart(): void {
    const STOCKS = SP500_MISSING;
    // update scales & axis
    this.xScale.domain(d3.extent(STOCKS, (d) => d.date));
    this.yScale.domain(d3.extent(STOCKS, (d) => d.value));
    this.xAxis.transition().call(d3.axisBottom(this.xScale));
    this.yAxis.transition().call(d3.axisLeft(this.yScale));
    this.line = d3.line().x((d: any) => this.xScale(d.date))
      .y((d: any) => this.yScale(d.value));

    const update = this.chart.selectAll('.line')
      .data(this.data);

    // remove exiting line
    update.exit().remove();


    // update existing line
    this.chart.selectAll('.line').transition()
      .attr('d', this.line);

  }

}
