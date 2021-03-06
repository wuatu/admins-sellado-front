import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MenubarService } from 'src/app/services/menubar.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthModule } from 'src/app/auth/auth.module';
import { Router } from '@angular/router';
import { AdministradorService } from 'src/app/services/administrador.service';
import { Administrador } from 'src/app/models/administrador';
declare var name: any;
@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  rol = 0;
  admin: Administrador ;
  expandItem=0;
  expandItemAnterior=0;
  constructor(
    public menubar: MenubarService,
    private authService: AuthService,
    private router: Router,
  ){
  }

  ngOnInit() {
    new name();
    this.admin = JSON.parse(localStorage.getItem('USER'));
    if(this.admin.rol == 1) {
      this.rol = 1;
    }else if(this.admin.rol == 2){
      this.rol = 2;
    }
  }

  showMenu() {
    this.menubar.visibleToggleAction();
  }

  logout() {
    this.authService.logout();
    this.authService.isLogin();
    this.router.navigate(['/auth/login']);
  }

  setCurrentItem(i,produccion?,administrar?,registros?,seguimiento?,monitoreo?) {
    if(this.expandItemAnterior==1 && i != 1){
      produccion.click();
    } else if(this.expandItemAnterior==2 && i != 2){
      administrar.click();
    } else if(this.expandItemAnterior==3 && i != 3){
      registros.click();
    } else if(this.expandItemAnterior==4 && i != 4){
      seguimiento.click();
    } else if(this.expandItemAnterior==5 && i != 5){
      monitoreo.click();
    } else{

    }
    if (i == 1 && this.expandItemAnterior==1) {
      this.expandItem=1;
      this.expandItemAnterior=0;
    } else if(i == 1 && this.expandItemAnterior!=1){
      this.expandItem=1;
      this.expandItemAnterior=1;
    } else if(i == 2 && this.expandItemAnterior==2){
      this.expandItem=2;
      this.expandItemAnterior=0;
    } else if (i == 2 && this.expandItemAnterior!=2) {
      this.expandItem=2;
      this.expandItemAnterior=2;
    } else if (i == 3 && this.expandItemAnterior==3) {
      this.expandItem=3;
      this.expandItemAnterior=0;
    } else if(i == 3 && this.expandItemAnterior!=3){
      this.expandItem=3;
      this.expandItemAnterior=3;
    } else if (i == 4 && this.expandItemAnterior==4) {
      this.expandItem=4;
      this.expandItemAnterior=0;
    } else if(i == 4 && this.expandItemAnterior!=4){
      this.expandItem=4;
      this.expandItemAnterior=4;
    }else if (i == 5 && this.expandItemAnterior==5) {
      this.expandItem=5;
      this.expandItemAnterior=0;
    } else if(i == 5 && this.expandItemAnterior!=5){
      this.expandItem=5;
      this.expandItemAnterior=5;
    }
  }
}
