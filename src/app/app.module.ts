import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material-module';
import {MatListModule} from '@angular/material';
import {ExoticChartsComponent} from './exotic-charts/exotic-charts.component';
import {AppRoutingModule} from './app-routing.module';
import {SidenavService} from './shared/sidenav.service';
import {MapComponent} from './map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    ExoticChartsComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    MatListModule
  ],
  providers: [SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
