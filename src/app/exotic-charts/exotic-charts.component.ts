import {AfterContentChecked, AfterViewInit, Component} from '@angular/core';
import * as c3 from 'c3';
import {BalizData} from '../shared/baliz-data-model';
import {BalizDataService} from '../shared/baliz-data.service';

@Component({
  selector: 'app-exotic-charts',
  templateUrl: './exotic-charts.component.html',
  styleUrls: ['./exotic-charts.component.scss']
})
export class ExoticChartsComponent implements AfterViewInit {
  chart: any;
  objJSON: BalizData[];
  varNames: string[];
  names: any;
  selectedTargets: string[];

  constructor(private balizDataService: BalizDataService) {
  }

  ngAfterViewInit(): void {
    this.varNames = ['temperature', 'humidity', 'luminosity'];
    this.balizDataService.findDataForDevice('30D1E0').subscribe((res) => {
      this.objJSON = res;
      this.initChart();
    });

    setInterval(() => {
      this.reload();
    }, 5000);
  }

  initChart() {
    const self = this;

    this.chart = c3.generate({
      bindto: '#chart',
      data: {
        x: 'x',
        xFormat: '%Y-%m-%dT%H:%M:%S.%L%Z', // 2019-05-09T09:18:59.000+0000
        json: self.objJSON,
        keys: {
          x: 'timestamp',
          value: this.varNames.map((v) => `${v}`)
        },
        names: this.names
      },
      axis: {
        x: {
          type: 'timeseries',
          localtime: true,
          tick: {
            centered: true,
            format: '%Y-%m-%dT%H:%M',
            count: 31,
            culling: {
              max: 10
            }
          }
        }
      },
      point: {
        r: function (d) {
          return 3;
        },
        select: {
          r: 12
        }
      },
      zoom: {
        enabled: false,
        rescale: true
      },
      subchart: {
        show: true
      },
      tooltip: {
        grouped: true
      },
      legend: {
        item: {
          onclick: function (id) {
            const indexTarget = self.selectedTargets.indexOf(id);
            (indexTarget !== -1) ? self.selectedTargets.splice(indexTarget, 1) : self.selectedTargets.push(id);

            self.chart.toggle(id);
            return true;
          }
        }
      }
    });

    this.showHideTarget();
  }

  /**
   * Show/hide chart lines
   */
  showHideTarget() {
    this.chart.hide();
    this.chart.show(this.selectedTargets);
  }

  reload() {
    console.log('reload chart');
    this.balizDataService.findDataForDevice('30D1E0').subscribe((res) => {
      this.objJSON = res;
      this.chart.flow(res);
      this.chart.flush();
    });
  }
}
