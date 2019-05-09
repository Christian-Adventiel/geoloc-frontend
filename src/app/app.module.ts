import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MapComponent} from './map/map.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SidenavComponent} from './sidenav/sidenav.component';
import {MaterialModule} from './material-module';
import {MatListModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidenavComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
