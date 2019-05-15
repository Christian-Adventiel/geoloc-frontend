import {Component, OnInit, ViewChild} from '@angular/core';
import {DeviceService} from './shared/device.service';
import {Router} from '@angular/router';
import {MatSidenav} from '@angular/material';
import {SidenavService} from './shared/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'IOT & traçabilité';
  navLinks: any[];
  activeLinkIndex = -1;
  @ViewChild('sidenav') public sideNav: MatSidenav;

  constructor(private deviceService: DeviceService, private router: Router, private sidenavService: SidenavService) {
    this.navLinks = [
      {
        label: 'Map',
        link: './map',
        index: 0
      }, {
        label: 'Charts',
        link: './charts',
        index: 1
      }
    ];
  }

  ngOnInit() {
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
  }

  toggleSide() {
    this.sidenavService.toggle();
  }
}
