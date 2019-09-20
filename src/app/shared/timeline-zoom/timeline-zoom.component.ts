import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { SP500_MISSING, Artist } from '../datamanager';
import { DataManager, METDATA } from '../datamg';
import d3 = require('d3');
import dat = require('dat.gui');
import * as moment from 'moment';
import { GUI } from 'dat-gui';
import jz = require('jeezy');

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// https://bl.ocks.org/robyngit/9cb44496954ef5d1c36f0dee064008a2/edb657ba06632489d77c3635353e921f12fb25b0
// https://bl.ocks.org/armollica/3b5f83836c1de5cca7b1d35409a013e3
// https://github.com/flrs/visavail
// https://www.visualcinnamon.com/2016/06/fun-data-visualizations-svg-gooey-effect.html

@Component({
  selector: 'app-timeline-zoom',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './timeline-zoom.component.html',
  styleUrls: ['./timeline-zoom.component.css']
})

export class TimelineZoomComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  // title = 'Spatio-Temporal Uncertainty Mosaic';
  title = '';
  private margin: Margin;
  private margin2: Margin;

  private width: number;
  private height: number;
  private height2: number;

  private svg: any;     // TODO replace all `any` by the right type

  private x: any;
  private x2: any;
  private y: any;
  private y2: any;
  private y3: any;

  private xAxis: any;
  private xAxis2: any;
  private yAxis: any;

  private context: any;
  private legend: any;
  private brush: any;
  private zoom: any;
  private zoomContainer: any;
  private area: any;
  private area2: any;
  private focus: any;
  private line: d3.Line<[number, number]>;
  private lineChart: any;
  private uData: DataManager;
  private rect: any;
  private objects: any;
  private gooey: any;

  constructor() {
    // this.uData = new DataManager(this.parseData(SP500_MISSING));
    // this.uData = new DataManager(this.parseArtistData(Artist));
  }

  ngOnInit() {
    METDATA.then((data) => {
      this.uData = new DataManager(this.parseMetData(data));
      this.initSvg();
      this.drawChart(this.parseMetData(data));
      // GUI
      this.privateGUI(this.parseMetData(data));
    });
  }

  privateGUI(data) {
    // controls
    // const gui: GUI = new dat.default.GUI({ width: 300 }); //why default?
    const gui: GUI = new dat.default.GUI();
    const obj = {
      message: 'Uncertainty Mosaic',
      uvfilter: false,
      force: false,
      maxSize: 6.0,
      speed: 5,
      Uncertainty: 'Gooey'
    };

    // gui.remember(obj);
    gui.add(obj, 'message');
    // gui.add(obj, 'uvfilter').onChange(() => {
    //   const value = obj.uvfilter;
    //   if (obj.uvfilter) {
    //     this.objects.selectAll('.objects').style('display', (d: any) => {
    //       if (!d.tempUC.includes('ca.')) {
    //         return 'none';
    //       }
    //     });
    //   } else {
    //     this.objects.selectAll('.objects').style('display', 'block');
    //   }

    // });

    // gui.add(obj, 'force').onChange(() => {
    //   if (obj.force) {
    //     this.forceSimulation(data);
    //   } else {
    //     this.objects.selectAll('.objects').style('display', 'block');
    //   }
    // });

    gui.add(obj, 'Uncertainty', ['Gooey', 'Transparency', 'Colors']).onChange(() => {
      const val = obj.Uncertainty;
      if (val === 'Gooey') {
        this.updateGooey();
      } else if (val === 'Transparency') {
        this.updateTransparency(data);
      } else if (val === 'Colors') {
        this.updateColors(data);
      }
    });

  }


  private parseData(data: any[]) {
    return data.map(v => {
      return {
        date: moment(v.date),
        value: v.price
      };
    });
  }

  private parseMetData(data: any[]) {
    return data.map(d => {
      return {
        id: d['Artist ID'],
        date: moment(new Date(d['Object Begin Date'], 1, 1)),
        date2: moment(new Date(d['Object End Date'], 1, 1)),
        value: +d['Object ID'],
        nationality: d.Nationality,
        title: d.Title,
        image: d.API_response.primaryImageSmall,
        tempUC: d['Object Date'],
        spatUC: d['Geography Type'],
        country: d.Country,
        county: d.County,
        classification: d.Classification
        // classification: d.Country
      };
    });
  }


  private initSvg() {
    this.margin = { top: 20, right: 0, bottom: 140, left: 40 };
    this.margin2 = { top: 320, right: 0, bottom: 20, left: 40 };

    const element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left + this.margin.right;
    this.height = element.offsetHeight - this.margin.top + this.margin.bottom;
    this.height2 = element.offsetHeight - this.margin2.top + this.margin2.bottom;


    this.svg = d3.select(element).append('svg')
      .attr('id', 'container')
      .attr('height', element.offsetHeight + this.margin.top + this.margin.bottom + this.height2)
      .attr('width', element.offsetWidth + this.margin.left + this.margin.right);

    this.x = d3.scaleTime().range([0, this.width]);
    this.x2 = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.y2 = d3.scaleLinear().range([this.height2, 0]);
    this.y3 = d3.scaleBand().rangeRound([0, this.height]);

    this.xAxis = d3.axisBottom(this.x);
    this.xAxis2 = d3.axisBottom(this.x2);
    this.yAxis = d3.axisLeft(this.y3).tickSize(0);

    this.brush = d3.brushX()
      .extent([[0, 20], [this.width, this.height2]])
      .on('brush end', this.brushed.bind(this));

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', this.zoomed.bind(this));

    // draw line
    this.line = d3.line()
      .defined(function (d: any) {
        return d.value !== null;
      })
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    // draw area focus
    this.area = d3.area()
      .defined(this.line.defined())
      // .curve(d3.curveMonotoneX)
      .x((d: any) => this.x(d.date))
      .y0(this.height)
      .y1((d: any) => this.y(d.value));

    // draw area context
    this.area2 = d3.area()
      // .curve(d3.curveMonotoneX)
      .x((d: any) => this.x2(d.date))
      .y0(this.height2)
      .y1((d: any) => this.y2(d.value));

    // clipping
    this.svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

    // focus
    this.focus = this.svg.append('g')
      .attr('class', 'focus')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // context
    this.context = this.svg.append('g')
      .attr('class', 'context')
      .attr('transform', 'translate(' + this.margin2.left + ',' + (this.height) + ')');


    // linechart
    this.lineChart = this.svg.append('g')
      .attr('class', 'uncertainty')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    const defs = this.svg.append('defs');
    const filter = defs.append('filter').attr('id', 'gooeyCodeFilter');
    filter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '10')
      //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
      .attr('color-interpolation-filters', 'sRGB')
      .attr('result', 'blur');
    filter.append('feColorMatrix')
      .attr('in', 'blur')
      .attr('mode', 'matrix')
      .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9')
      .attr('result', 'gooey');

    //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
    const defs2 = this.svg.append('defs');
    const filter2 = defs.append('filter').attr('id', "gooeyCodeFilter2");
    filter2.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '10')
      //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
      .attr('color-interpolation-filters', "sRGB")
      .attr('result', "blur");
    filter2.append('feColorMatrix')
      .attr('in', "blur")
      .attr('mode', "matrix")
      .attr('values', "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
      .attr('result', "gooey");

    filter2.append('feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'gooey');

    // zoom container
    this.zoomContainer = this.svg.append('g')
      .attr('class', 'zoomContainer');

    // objects
    this.objects = this.svg.append('g')
      .attr('class', 'objects')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // gooey
    this.gooey = this.svg.append('g')
      .style('filter', 'url(#gooeyCodeFilter)')
      .attr('class', 'gooey')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // legend
    this.legend = this.svg.append('g')
      .attr('class', 'legendContainer');
  }

  private brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') { return; } // ignore brush-by-zoom
    const s = d3.event.selection || this.x2.range();
    this.x.domain(s.map(this.x2.invert, this.x2));
    this.focus.select('.area').attr('d', this.area);
    this.focus.select('.area2').attr('d', this.area);
    this.focus.select('.axis--x').call(this.xAxis);
    this.svg.select('.zoom').call(this.zoom.transform, d3.zoomIdentity
      .scale(this.width / (s[1] - s[0]))
      .translate(-s[0], 0));
    this.lineChart.select('.line').attr('d', this.line);

    this.objects.selectAll('.objects').attr('cx', (d: any) => this.x(d.date));
    this.gooey.selectAll('.objects').attr('cx', (d: any) => this.x(d.date));
  }


  private zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') { return; } // ignore zoom-by-brush
    const t = d3.event.transform;
    this.x.domain(t.rescaleX(this.x2).domain());

    this.focus.select('.area').attr('d', this.area);
    this.focus.select('.area2').attr('d', this.area);
    this.focus.select('.axis--x').call(this.xAxis);
    this.context.select('.brush').call(this.brush.move, this.x.range().map(t.invertX, t));
    this.lineChart.select('.line').attr('d', this.line);

    this.objects.selectAll('.objects').attr('cx', (d: any) => this.x(d.date));
    this.gooey.selectAll('.objects').attr('cx', (d: any) => this.x(d.date));
  }

  private drawChart(data: any) {

    this.x.domain(d3.extent(data, (d: any) => d.date));
    this.y.domain([0, d3.max(data, (d: any) => d.value)]);
    this.x2.domain(this.x.domain());
    this.y2.domain(this.y.domain());
    this.line = d3.line().x((d: any) => this.x(d.date)).y((d: any) => this.y(d.value));

    const classification = jz.arr.sortBy(jz.arr.pivot(data, 'classification'), 'count', 'asce');
    this.y3.domain(classification.map(function (d) { return d.classification; }));

    this.focus.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.focus.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(100,' + 0 + ')')
      .call(this.yAxis.tickFormat(function (d) {
        return classification.filter(function (c) {
          return c.classification == d;
        })[0].classification;
      }));

    // selection box
    this.aggregateArea();

    // line
    // this.lineChart.append('path')
    //   .attr('class', 'line')
    //   .datum(this.uData.getCompleteData())
    //   .attr('d', this.line)
    //   .style('fill', 'none')
    //   .style('stroke', 'blue');

    // legend

    // zoom
    this.zoomContainer.append('rect')
      .attr('class', 'zoom')
      .style('fill', 'transparent')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(this.zoom);

    // groups
    // this.UncertainBar(this.uData.getCompleteData(), this.uData.getMissingMonthData(), 40);
    // this.UncertainArea(this.uData.getCompleteData(), this.uData.getMissingMonthData());

    // objects
    // const nest = d3.nest().key(function (d: any) {
    //   return d.classification;
    // }).entries(data);

    // const color = d3.scaleSequential(d3.interpolateRainbow).domain([this.height, 0]);
    // nest.forEach((group: any, i: number) => {
    //   this.drawObjects(group.values, (this.height - 50) - (i * 4), color(i));
    // });

    this.drawObjects(data);
  }

  private UncertainBar(dataComplete: any, dataMissing?: any, offSet?: number) {
    const uncLines = this.area
      .y0(this.height)
      .y1(this.height - offSet);

    const group = this.focus.append('g').attr('class', 'UncertainBar');
    group.append('path')
      .datum(dataComplete)
      .attr('class', 'area')
      .attr('fill', 'red')
      .attr('d', uncLines);

    group.append('path')
      .datum(dataMissing)
      .attr('class', 'area2')
      .attr('fill', 'yellow')
      .attr('d', uncLines);

  }

  private UncertainArea(dataComplete: any, dataMissing?: any) {
    const group = this.focus.append('g').attr('class', 'UncertainArea');
    // // // focus
    // this.focus.append('path')
    //   .datum(this.uData.getCompleteData())
    //   .attr('class', 'area')
    //   .attr('d', this.area);
    // // focus missing
    // this.focus.append('path')
    //   .datum(this.uData.getMissingDailyData())
    //   .attr('class', 'area2')
    //   .attr('d', this.area);

    // focus
    group.append('path')
      .datum(dataComplete)
      .attr('class', 'area')
      .attr('d', this.area);
    // focus missing
    group.append('path')
      .datum(dataMissing)
      .attr('class', 'area2')
      .attr('d', this.area);

  }

  private drawObjects(dataComplete: any) {

    this.objects.selectAll('objects')
      .data(dataComplete)
      .enter()
      .append('circle')
      .attr('class', 'objects')
      .attr('r', 4)
      .attr('cx', (d: any) => this.x(d.date))
      .attr('cy', (d: any) => this.y3(d.classification))
      // .attr('cy', (d: any) => height)
      .attr('fill', (d: any) => {
        if (d.tempUC.includes('ca.')) {
          return 'yellow';
        } else {
          return '#00AA8D';
        }
      })
      .on('mouseover', (d: any) => {
        d3.select('.previewImage')
          .attr('src', d.image);
        d3.select('.previewTitle')
          .text(d.title);
      });

    this.gooey.selectAll('objects')
      .data(dataComplete)
      .enter()
      .append('circle')
      .attr('class', 'objects')
      .style('pointer-events', 'none')
      .attr('r', 10)
      .attr('cx', (d: any) => this.x(d.date))
      .attr('cy', (d: any) => this.y3(d.classification))
      // .attr('cy', (d: any) => height)
      .attr('fill', (d: any) => {
        // if (d.spatUC === 'Made in') {
        if (d.tempUC.includes('ca.')) {
          return 'yellow';
        } else {
          // return color;
          return '#00AA8D';
        }
      });
  }


  private aggregateArea() {
    // context
    // this.context.append('path')
    //   .datum(dataComplete)
    //   .attr('class', 'area2')
    //   .attr('d', this.area2);

    // this.context.append('g')
    //   .attr('class', 'axis axis--x')
    //   .attr('transform', 'translate(0,' + (this.height + this.margin.bottom) + ')')
    //   .call(this.xAxis2);

    this.context.append('g')
      .attr('class', 'brush')
      .call(this.brush)
      .call(this.brush.move, this.x.range());

    // legend
    const legendWidth = 400;

    const defs = this.legend.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient');

    linearGradient.attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.selectAll('stop')
      .data([
        { offset: '0%', color: 'yellow' },
        // { offset: '10%', color: '#EC93AB' },
        // { offset: '15%', color: '#CEB1DE' },
        // { offset: '20%', color: '#95D3F0' },
        // { offset: '25%', color: '#77EDD9' },
        { offset: '100%', color: '#00AA8D' }
      ])
      .enter().append('stop')
      .attr('offset', function (d) {
        return d.offset;
      })
      .attr('stop-color', function (d) {
        return d.color;
      });

    this.legend.append('text')
      .attr('transform', 'translate(' + ((this.width / 2) - ((this.width / 2) / 2)) + ',' + (this.height + 115) + ')')
      .text('High Uncertainty');

    this.legend.append('rect')
      .attr('y', (this.height + 100))
      .attr('x', (this.width / 2 - (legendWidth / 3)))
      .style('fill', 'url(#linear-gradient)')
      .attr('width', legendWidth)
      .attr('height', 30);

    this.legend.append('text')
      .attr('transform', 'translate(' + ((this.width / 2) + ((this.width / 2) / 2)) + ',' + (this.height + 115) + ')')
      .text('Low Uncertainty');

    this.legend.append('text')
      .attr('class', 'objectCount')
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.height + 115) + ')');
    // .text(`Count: ${0}`);
  }

  private forceSimulation(nodes: any) {

    const simulation = d3.forceSimulation(nodes)
      .force('y', d3.forceY(250))
      .force('collide', d3.forceCollide().radius(function (d) { return 4; }))
      .force('manyBody', d3.forceManyBody().strength(-10))
      .stop();

    for (let i = 0; i < 150; ++i) { simulation.tick(); }

    const objects = this.objects.selectAll('.objects')
      .data(nodes)
      // .attr('cx', (d: any) => this.x(d.date))
      .attr('cx', (d: any) => this.x(d.date))
      .attr('cy', function (d) { return d.y; });

    const gooey = this.gooey.selectAll('.objects')
      .data(nodes)
      // .attr('cx', (d: any) => this.x(d.date))
      .attr('cx', (d: any) => this.x(d.date))
      .attr('cy', function (d) { return d.y; });
  }

  private updateGooey() {
    // show filter
    d3.selectAll('.gooey')
      .style('display', 'block')
      .style('filter', 'gooeyCodeFilter');

      this.objects.selectAll('.objects')
      .attr('opacity', '1');

  }

  private updateTransparency(data: any) {

    // hide filter
    d3.selectAll('.gooey')
      .style('display', 'none');

    this.objects.selectAll('.objects')
      .data(data)
      .attr('opacity', (d: any) => {
        if (d.tempUC.includes('ca.')) {
          return '0.4';
        } else {
          return '0.9';
        }
      })
      .attr('fill', '#00AA8D');
  }

  private updateColors(data) {
    // hide filter
    d3.selectAll('.gooey')
      .style('display', 'none');

    this.objects.selectAll('.objects')
      .data(data)
      .attr('fill', (d: any) => {
        if (d.tempUC.includes('ca.')) {
          return 'yellow';
        } else {
          return '#00AA8D';
        }
      });

  }

}
