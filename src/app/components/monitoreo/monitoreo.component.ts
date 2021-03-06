import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbCalendar, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Toast, ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { AdministradorService } from 'src/app/services/administrador.service';
import { TurnoService } from 'src/app/services/turno.service';
import { Turno } from 'src/app/models/turno';
import { formatDate } from '@angular/common';
import { RegistroService } from '../../services/registro.service';
import { CalibradorService } from '../../services/calibrador.service';
import { MonitoreoService } from '../../services/monitoreo.service';
import { RegistroDevService } from '../../services/registro-dev.service';
import { timer, interval, Subscription, Observable } from 'rxjs';
import { GetDateService } from 'src/app/services/get-date.service';
import { LineaService } from 'src/app/services/linea.service';
import { ActivatedRoute, Params, Router } from '@angular/router';


@Component({
  selector: 'app-monitoreo',
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.css']
})
export class MonitoreoComponent implements OnInit {
  @ViewChild("mymodaliniciarturno") modalIniciarTurno: ElementRef;
  @ViewChild("showmenu") showmenu: ElementRef;

  lineas: any = [];

  iniciarCerrar = "iniciar";
  IniciarCerrar = "Iniciar";
  time = new Date();
  passAdmin = "";
  rutAdmin = "";
  closeResult = "";
  turnoIniciado = false;
  botonIniciarTurnoClass = "btn-primary";
  botonIniciarTurnoText = "Iniciar turno";
  turno;
  //calendar
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  isBusqueda = false;
  desde: string = "";
  hasta: string = "";
  tituloBuscarPatente = "Búsqueda de patente";
  cantidadResultadoBusqueda = 0;
  isVisiblegoogleMaps = true;

  calibradores: any = [];
  cajasTotalCalibrador1Turno: any = [];
  cajasTotalCalibrador2Turno: any = [];
  cajasCalibrador1Turno: any = [];
  cajasCalibrador2Turno: any = [];
  cajasCalibrador1Hora: any = [];
  cajasCalibrador2Hora: any = [];
  cajasCalibrador1Minuto: any = [];
  cajasCalibrador2Minuto: any = [];




/********************************************************/
/********************************************************/
  cajasTotalCalibradorTurno: any = [];
  cajasCalibradorTurno: any = [];
  cajasCalibradorHora: any = [];
  cajasCalibradorMinuto: any = [];

  totalTurno: any = [];
  totalHora: any = [];
  totalMinuto: any = [];
  totalBoxCaliper: any = [];

  totalTurnoAux: any;
  totalHoraAux: any;
  totalMinutoAux: any;
  totalBoxCaliperAux: any;

  totalTurnoAux2: any;
  totalHoraAux2: any;
  totalMinutoAux2: any;
  totalBoxCaliperAux2: any;

/********************************************************/
/********************************************************/





  turnosCalibradores: any = [];

  totalTurno1: number = 0;
  totalHora1: number = 0;
  totalMinuto1: number = 0;

  totalTurno2: number = 0;
  totalHora2: number = 0;
  totalMinuto2: number = 0;

  totalBoxCaliper1: number = 0;
  totalBoxCaliper2: number = 0;

  fechaActual: string;
  fechaInicioTurno: string = null;
  horaInicioTurno: string = null;

  turnoActualCalibrador1: any = [];
  turnoActualCalibrador2: any = [];
  subscriptionTimerTask: Subscription;
  subscriptionTimerTask1: Subscription;
  subscriptionTimerTask2: Subscription;
  subscriptionTimer: Subscription;
  subscriptionTimerProduccion: Subscription;

  subscriptionTimerReload: Subscription;

  timeOut1: any;
  timeOut2: any;

  calibrador1: boolean = false;
  calibrador2: boolean = false;

  offsetTime: any;
  show: boolean = false;

  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
    private administradorService: AdministradorService,
    private turnoService: TurnoService,
    private registroService: RegistroService,
    private authService: AuthService,
    public calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private calibradorService: CalibradorService,
    private monitoreoService: MonitoreoService,
    private registroDevService: RegistroDevService,
    private getDateService: GetDateService,
    private lineaService: LineaService,
    private router: Router
  ) {
    this.fromDate = calendar.getToday();
    this.desde = formatDate(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), "yyyy-MM-dd", 'en-US');
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
  }

  ngOnInit() {    
    this.isLoggedIn();      
    this.calibrador1 = false;
    this.calibrador2 = false;
    //Lista los calibradores que estan registrados en la base de datos.
    
    this.subscriptionTimerProduccion = timer(0, 10000).subscribe(() => {
      this.listarCalibradores();
    });
    
    //Trae el tiempo desde el servidor
    this.getDateService.dateGetTime().forEach((res: any) => {
      //console.log(res.date);
      this.offsetTime = new Date().getTime() - res.date;
      //console.log(this.offsetTime);
    });
    this.subscriptionTimer = timer(0, 1000).subscribe(() => {
      if (this.offsetTime != null) {
        //console.log(this.offsetTime);
        this.time = new Date(new Date().getTime() - this.offsetTime);
      }
    });
  }

  ngOnDestroy() {
    if (this.timeOut1 != null) {
      clearTimeout(this.timeOut1);
    }
    if (this.timeOut2 != null) {
      clearTimeout(this.timeOut2);
    }
    if (this.subscriptionTimer != null) {
      this.subscriptionTimer.unsubscribe();
    }

    if (this.subscriptionTimerReload != null) {
      this.subscriptionTimerReload.unsubscribe();
      console.log("mate al subscriptionTimerReload");
    }


  }

  isLoggedIn(): void {
    if (!this.authService.isLogin()) {
      this.router.navigate(['/auth/login'])
    } else{
      const user = JSON.parse(localStorage.getItem('USER'));
      console.log(user.rut);
      if(user.rut=="22222222-2"){
        this.router.navigate(['/monitoreocalibrador2']);

      } else if(user.rut=="11111111-1"){
        this.router.navigate(['/monitoreocalibrador1'])
      }
    }
  }

  
  


  finishStart() {
    if (this.timeOut1 != null) {
      clearTimeout(this.timeOut1);
    }
    if (this.timeOut2 != null) {
      clearTimeout(this.timeOut2);
    }
    if (this.subscriptionTimerReload != null) {
      this.subscriptionTimerReload.unsubscribe();
      console.log("mate al subscriptionTimerReload");
    }
    this.calibrador1 = false;
    this.calibrador2 = false;
    this.listarCalibradores();
  }






/*************************************************************************************************/
/******************************* OBTENCIÓN DE TURNO CALIBRADORES *********************************/
/*************************************************************************************************/
async getActualTurnosCalibradores() {
  
  this.monitoreoService.getActualTurnoCalibradores().subscribe(
    res => {
      if (res.status == 200 ) {
        console.log(this.calibradores);
        console.log("res.status = 200, turnos activos");
        this.turnosCalibradores = res.body;
        console.log(this.turnosCalibradores);

        //this.clearArrays()
 
        this.clearArrays();
        for(let i = 0; i< this.turnosCalibradores.length; i++){
          console.log("Ejecuntando for !!!!");
          console.log(this.calibradores[i]);
          console.log(this.turnosCalibradores[i]);
          this.getProduccionCalibradores(this.calibradores[i], this.turnosCalibradores[i]);
        }
       
      } else if (res.status == 204) {
        console.log("res.status = 204, no hay turnos activos");
        //this.finishStart();
      }

    },
    err => {
      this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getProduccionCalibrador1, component monitoreo');
      //this.finishStart();
    }
  )
}
clearArrays(){
  this.totalTurnoAux = [];
  this.totalHoraAux = [];
  this.totalMinutoAux = [];
  this.totalBoxCaliperAux = [];
}

async getProduccionCalibradores(calibrador:any, turno:any):Promise<any>{
    
    console.log("getProduccionCalibradores();");
    //console.log("totalMinutoAux");
    this.totalMinutoAux.push(await this.getAverageforMinuteCalibrador(calibrador,turno));
    
    //console.log("totalHoraAux");
    this.totalHoraAux.push(await this.getAverageLastHourCalibrador(calibrador, turno));
    
    //console.log("totalTurno");
    this.totalTurnoAux.push(await this.getProduccionTurnoCalibrador(calibrador, turno));
    
    //console.log("totalBoxCaliper");
    this.totalBoxCaliperAux.push(await this.getProduccionTotalTurnoCalibrador(calibrador, turno));
    
    if(this.turnosCalibradores.length == this.totalBoxCaliperAux.length){
      
      this.totalMinutoAux2 = this.ordenar(this.totalMinutoAux);
      this.totalHoraAux2 = this.ordenar(this.totalHoraAux);
      this.totalTurnoAux2 = this.ordenar(this.totalTurnoAux);
      this.totalBoxCaliperAux2 = this.ordenar(this.totalBoxCaliperAux);
      
      console.log(this.totalMinutoAux2);
      console.log(this.totalHoraAux2);
      console.log(this.totalTurnoAux2);
      console.log(this.totalBoxCaliperAux2);
      this.show = true;
    }
  
}

ordenar(array: any []){
  let arrayAux: any = [];
    for(let calibrador of this.calibradores){
      
      for(let arr of array){
        if(calibrador.id == arr.calibrador){
          arrayAux.push(arr);
          break;
        }
      }
    }
  return arrayAux;
}


/*************************************************************************************************/
/*************************************************************************************************/

/*************************************************************************************************/
/****************************************    PRODUCCION     **************************************/
/*************************************************************************************************/

// Método que realiza la ejecución para saber el promedio de cajas selladas por minuto  durante el turno
//a la consulta de la base de datos se le pasa el calibrador, la fecha de inicio del turno, la hora de inicio del turno y si el turno esta en el mismo dia que inicio o se extendio a otro
async getAverageforMinuteCalibrador(calibrador: any, turno: any): Promise <any> {
  return new Promise((resolve, reject) => {
    this.cajasCalibradorMinuto = [];
    let totalMinuto : any;
    if (calibrador != null && turno != null) {
      //consulta para el calibrador 1
      this.monitoreoService.getAverageforMinute2(calibrador.id, turno.id, turno.fecha_apertura, turno.hora_apertura).subscribe(
        res => {
          //this.cajasCalibradorMinuto.push(res);
          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
          //console.log("getAverageForMinuteCalibrador");
          
          if (res[0].total == null || res[0].total == "NaN" || res[0].total == "0.0") {
            res[0].total = 0;
            totalMinuto = {calibrador: calibrador.id, turno: turno.id, total:res[0].total, tipo: "2"};
          }
          else {
            totalMinuto = {calibrador: calibrador.id, turno: turno.id, total:res[0].total, tipo: "2"};
          }
          //console.log(this.totalMinuto);
          //console.log("RESOLVE getAverageforMinuteCalibrador");
          //console.log(totalMinuto);
          resolve(totalMinuto);
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto del calibrador 1, método getAverageForMinute, component monitoreo');
          this.toastr.error('No obtenido', 'No obtenido');
        }
      )
    }
  })


}
//Método que ejecuta los servicios para consultar el promedio de cajas selladas en la útima hora del turno.
async getAverageLastHourCalibrador(calibrador: any, turno: any):Promise <any> {
  return new Promise((resolve, reject) => {
    if (calibrador != null && turno != null) {
      //consulta para el calibrador 1
      let totalHora : any;
      this.monitoreoService.getAverageforMinuteLastHour2(calibrador.id, turno.id, turno.fecha_apertura, turno.hora_apertura).subscribe(
        res => {
          //this.cajasCalibradorHora.push(res);
          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
          //console.log("getAverageLastHourCalibrador");
          
          if (res[0].total == null || res[0].total == "NaN" || res[0].total == "0.0") {
            res[0].total = 0;
            totalHora = {calibrador: calibrador.id, turno: turno.id, total:res[0].total, tipo: "1"};
          }
          else {
            totalHora = {calibrador: calibrador.id, turno: turno.id, total:res[0].total, tipo: "1"};
          }
          //console.log(this.totalHora);
          resolve(totalHora);
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto de la ultima hora del calibrador 1, método getAverageLastHour, component monitoreo');
          this.toastr.error('NO obtenido', 'NO obtenido');
        }
      )
    }
  })
}


//Método que ejecuta los servicios para consultar el promedio de cajas selladas del turno.
async getProduccionTurnoCalibrador(calibrador: any, turno: any):Promise<any> { 
  //consulta calibrador 1
  return new Promise((resolve, reject) => {  
    if (calibrador != null && turno != null) {
      let totalTurno : any;
      this.monitoreoService.getProduccionSearch2(calibrador.id, turno.id, turno.fecha_apertura, turno.hora_apertura).subscribe(
        (res) => {
          //console.log("getProduccionTurnoCalibrador");
          
          //this.cajasCalibradorTurno.push(res);
          totalTurno = {calibrador:calibrador.id, turno:turno.id, total: res[0].total, tipo: "3"};
          //console.log(this.totalTurno);
          resolve(totalTurno);
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas del turno del calibrador 1, método getProduccionTurno, component monitoreo');
          this.toastr.error('Error calibrador 1', 'NO obtenido');
        }
      )
    }
  })
}

async getProduccionTotalTurnoCalibrador(calibrador: any, turno: any):Promise <any> {
  //consulta calibrador 1
  /*this.timeOut1 = setTimeout(() => {
    
  },
    10000);*/
  return new Promise((resolve, reject) => {
    if (calibrador != null && turno != null) {
      let totalBoxCaliper : any;
      this.monitoreoService.getProduccionTotalSearch2(calibrador.id, turno.id, turno.fecha_apertura, turno.hora_apertura).subscribe(
        (res) => {
          //console.log("getProduccionToralTurnoCalibrador");
          
          //this.cajasTotalCalibradorTurno.push(res);
          totalBoxCaliper = {calibrador:calibrador.id, turno:turno.id, total: res[0].total, tipo: "4"};
          //console.log(this.totalBoxCaliper);
          resolve(totalBoxCaliper);
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas totales del turno del calibrador 1, método getProduccionTotalTurnoCalibrador1, component monitoreo');
          this.toastr.error('Error calibrador 1', 'NO obtenido');
        }
      )
    }
  })
}


/*************************************************************************************************/
/*************************************************************************************************/



































/*************************************************************************************************/
/******************************* OBTENCIÓN DE TURNO CALIBRADORES *********************************/
/*************************************************************************************************/
  getProduccionCalibrador1() {

    this.monitoreoService.getLastTurno(this.calibradores[0].id).subscribe(
      res => {
        if (res.status == 200) {
          if (this.calibradores != null) {
            this.getProduccionTurnoCalibrador1();
          } else {
            this.toastr.success('Debe agregar un calibrador', 'Oops');
          }
        } else if (res.status == 204) {
          this.finishStart();
        }

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getProduccionCalibrador1, component monitoreo');
        this.finishStart();
      }
    )
  }

  getProduccionCalibrador2() {
    this.monitoreoService.getLastTurno(this.calibradores[1].id).subscribe(
      res => {
        if (res.status == 200) {
          if (this.calibradores != null) {
            this.getProduccionTurnoCalibrador2();
          } else {
            this.toastr.success('Debe agregar un calibrador', 'Oops');
          }
        } else if (res.status == 204) {
          this.finishStart();
        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getProduccionCalibrador1, component monitoreo');
        this.finishStart();
      }
    )

  }

  getTurnoActual(id_calibrador: number, calibrador: number) {
    this.monitoreoService.getLastTurno(id_calibrador).subscribe(
      res => {
        if (res.status == 200) {

          if (calibrador == 1) {
            this.calibrador1 = true;
            this.turnoActualCalibrador1 = res.body;
            this.getProduccionCalibrador1();
          } else if (calibrador == 2) {
            this.calibrador2 = true;
            this.turnoActualCalibrador2 = res.body;
            this.getProduccionCalibrador2();
          }

          if (this.calibrador2 == true && this.calibrador1 == true) {
            if (this.subscriptionTimerReload != null) {
              this.subscriptionTimerReload.unsubscribe();
              console.log("mate al subscriptionTimerReload ambos en true");
            }
          }

        } else if (res.status == 204) {
          if (calibrador == 1) {
            this.calibrador1 = false;
          } else if (calibrador == 2) {
            this.calibrador2 = false;
          }
        }

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo');
        this.toastr.error('error al cargar el turno.');
        if (calibrador == 1) {
          this.calibrador1 = false;
        } else if (calibrador == 2) {
          this.calibrador2 = false;
        }
      }
    )
  }
/*************************************************************************************************/
/*************************************************************************************************/

/*************************************************************************************************/
/****************************************    PRODUCCION     **************************************/
/*************************************************************************************************/

  // Método que realiza la ejecución para saber el promedio de cajas selladas por minuto  durante el turno
  //a la consulta de la base de datos se le pasa el calibrador, la fecha de inicio del turno, la hora de inicio del turno y si el turno esta en el mismo dia que inicio o se extendio a otro
  getAverageforMinuteCalibrador1() {
    this.getAverageLastHourCalibrador1();
    if (this.calibradores.length > 0 && this.calibrador1 == true) {
      //consulta para el calibrador 1
      this.monitoreoService.getAverageforMinute2(this.calibradores[0].id, this.turnoActualCalibrador1[0].id, this.turnoActualCalibrador1[0].fecha_apertura, this.turnoActualCalibrador1[0].hora_apertura).subscribe(
        res => {
          this.cajasCalibrador1Minuto = res;

          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
          if (this.cajasCalibrador1Minuto[0].total == null || this.cajasCalibrador1Minuto[0].total == "NaN") {
            this.totalMinuto1 = 0;
          }
          else {
            console.log(this.cajasCalibrador1Minuto[0].total);
            this.totalMinuto1 = this.cajasCalibrador1Minuto[0].total;
          }
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto del calibrador 1, método getAverageForMinute, component monitoreo');

          this.toastr.error('No obtenido', 'No obtenido');
        }
      )
    }



  }
  //Método que ejecuta los servicios para consultar el promedio de cajas selladas en la útima hora del turno.
  getAverageLastHourCalibrador1() {
    this.getProduccionTotalTurnoCalibrador1();
    
    if (this.calibradores.length > 0 && this.calibrador1 == true) {
      //consulta para el calibrador 1
      this.monitoreoService.getAverageforMinuteLastHour2(this.calibradores[0].id, this.turnoActualCalibrador1[0].id, this.turnoActualCalibrador1[0].fecha_apertura, this.turnoActualCalibrador1[0].hora_apertura).subscribe(
        res => {
          this.cajasCalibrador1Hora = res;

          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto

          if (this.cajasCalibrador1Hora[0].total == null || this.cajasCalibrador1Hora[0].total == "NaN") {
            this.totalHora1 = 0;

          }
          else {
            this.totalHora1 = this.cajasCalibrador1Hora[0].total;
          }
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto de la ultima hora del calibrador 1, método getAverageLastHour, component monitoreo');
          this.toastr.error('NO obtenido', 'NO obtenido');
        }
      )
    }



  }


  //Método que ejecuta los servicios para consultar el promedio de cajas selladas del turno.
  getProduccionTurnoCalibrador1() {
    this.getAverageforMinuteCalibrador1();
    //consulta calibrador 1
    if (this.calibradores.length > 0 && this.calibrador1 == true) {
      this.monitoreoService.getProduccionSearch2(this.calibradores[0].id, this.turnoActualCalibrador1[0].id, this.turnoActualCalibrador1[0].fecha_apertura, this.turnoActualCalibrador1[0].hora_apertura).subscribe(
        (res) => {
          this.cajasCalibrador1Turno = res;
          this.totalTurno1 = this.cajasCalibrador1Turno[0].total;


        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas del turno del calibrador 1, método getProduccionTurno, component monitoreo');
          this.toastr.error('Error calibrador 1', 'NO obtenido');
        }
      )

    }


  }

  getProduccionTotalTurnoCalibrador1() {
    //consulta calibrador 1
    this.timeOut1 = setTimeout(() => {
      this.getProduccionCalibrador1();
    },
      10000);
    if (this.calibradores.length > 0 && this.calibrador1 == true) {
      this.monitoreoService.getProduccionTotalSearch2(this.calibradores[0].id, this.turnoActualCalibrador1[0].id, this.turnoActualCalibrador1[0].fecha_apertura, this.turnoActualCalibrador1[0].hora_apertura).subscribe(
        (res) => {
          this.cajasTotalCalibrador1Turno = res;
          this.totalBoxCaliper1 = this.cajasTotalCalibrador1Turno[0].total;
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas totales del turno del calibrador 1, método getProduccionTotalTurnoCalibrador1, component monitoreo');
          this.toastr.error('Error calibrador 1', 'NO obtenido');
        }
      )
    }
  }

  getProduccionTotalTurnoCalibrador2() {
    //consulta calibrador 1
    this.timeOut2 = setTimeout(() => {
      this.getProduccionCalibrador2();
    },
      10000);
    if (this.calibradores.length > 0 && this.calibrador2 == true) {
      this.monitoreoService.getProduccionTotalSearch2(this.calibradores[1].id, this.turnoActualCalibrador2[0].id, this.turnoActualCalibrador2[0].fecha_apertura, this.turnoActualCalibrador2[0].hora_apertura).subscribe(
        (res) => {
          this.cajasTotalCalibrador2Turno = res;

          this.totalBoxCaliper2 = this.cajasTotalCalibrador2Turno[0].total;

        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas totales del turno del calibrador 2, método getProduccionTotalTurnoCalibrador2, component monitoreo');
          this.toastr.error('Error calibrador 2', 'NO obtenido');
        }
      )
    }
  }



  // Método que realiza la ejecución para saber el promedio de cajas selladas por minuto  durante el turno
  //a la consulta de la base de datos se le pasa el calibrador, la fecha de inicio del turno, la hora de inicio del turno y si el turno esta en el mismo dia que inicio o se extendio a otro
  getAverageforMinuteCalibrador2() {
    this.getAverageLastHourCalibrador2();

    if (this.calibradores.length > 1 && this.calibrador2 == true) {
      //consulta para el calibrador 2
      this.monitoreoService.getAverageforMinute2(this.calibradores[1].id, this.turnoActualCalibrador2[0].id, this.turnoActualCalibrador2[0].fecha_apertura, this.turnoActualCalibrador2[0].hora_apertura).subscribe(
        res => {
          this.cajasCalibrador2Minuto = res;
          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
          if (this.cajasCalibrador2Minuto[0].total == null || this.cajasCalibrador2Minuto[0].total == "NaN") {
            this.totalMinuto2 = 0;
          }
          else {
            this.totalMinuto2 = this.cajasCalibrador2Minuto[0].total;
          }
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto del calibrador 2, método getAverageForMinute, component monitoreo');
          this.toastr.error('NO obtenido', 'NO obtenido');
        }
      )
    }


  }
  //Método que ejecuta los servicios para consultar el promedio de cajas selladas en la útima hora del turno.
  getAverageLastHourCalibrador2() {
    this.getProduccionTotalTurnoCalibrador2();
    

    if (this.calibradores.length > 1 && this.calibrador2 == true) {
      //consulta para el calibrador 2
      this.monitoreoService.getAverageforMinuteLastHour2(this.calibradores[1].id, this.turnoActualCalibrador2[0].id, this.turnoActualCalibrador2[0].fecha_apertura, this.turnoActualCalibrador2[0].hora_apertura).subscribe(
        res => {
          this.cajasCalibrador2Hora = res;
          //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
          if (this.cajasCalibrador2Hora[0].total == null || this.cajasCalibrador2Hora[0].total == "NaN") {
            this.totalHora2 = 0;
          }
          else {
            this.totalHora2 = this.cajasCalibrador2Hora[0].total;
          }
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto de la ultima hora del calibrador 2, método getAverageLastHour, component monitoreo');
          this.toastr.error('NO obtenido', 'NO obtenido');
        }
      )
    }



  }


  //Método que ejecuta los servicios para consultar el promedio de cajas selladas del turno.
  getProduccionTurnoCalibrador2() {
    this.getAverageforMinuteCalibrador2();
    if (this.calibradores.length > 1 && this.calibrador2 == true) {
      //consulta para el calibrador 2
      this.monitoreoService.getProduccionSearch2(this.calibradores[1].id, this.turnoActualCalibrador2[0].id, this.turnoActualCalibrador2[0].fecha_apertura, this.turnoActualCalibrador2[0].hora_apertura).subscribe(
        res => {
          this.cajasCalibrador2Turno = res;
          //console.log(this.cajasCalibrador2Turno[0].total);
          this.totalTurno2 = this.cajasCalibrador2Turno[0].total;
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener la cantidad de cajas del turno del calibrador 2, método getProduccionTurno, component monitoreo');
          this.toastr.error('Error calibrador 2', 'NO obtenido');
        }
      )
    }

  }
/*************************************************************************************************/
/*************************************************************************************************/


































  //metodo que lista las calibradores
  listarCalibradores() {
    this.calibradorService.getCalibradores().subscribe(
      res => {
        this.calibradores = res.body;
        this.getActualTurnosCalibradores()
        /*this.timeOut1 = setTimeout(() => {
          this.getActualTurnosCalibradores();
        },
          10000);*/
        
        //this.getLineOfCaliper();
      },
      err => {
        console.log(err);
        this.registroDevService.creaRegistroDev('No se pudieron obtener los calibradores, método listarCalibradores, component monitoreo');
        this.toastr.error('No se pudo obtener calibradores', 'Oops');
      }
    );
  }

  //Este método obtiene desde la base de datos todas las lineas que tiene el calibrador y ejecuta los métodos paras obtener la producción 
  getLineOfCaliper() {
    this.lineaService.getLineasId(this.calibradores[0].id).subscribe(
      res => {
        this.lineas = res.body;
        if (this.lineas != null) {

          this.subscriptionTimerReload = timer(0, 10000).subscribe(() => {
            console.log("ejecutando el suscripcion !!!!")
            if (this.calibradores.length > 0 && this.calibrador1 == false) {
              console.log("ejecuto el suscripcion con calibrador 1");
              this.getTurnoActual(this.calibradores[0].id, 1);
            }
            if (this.calibradores.length > 1 && this.calibrador2 == false) {
              console.log("ejecuto el suscripcion con calibrador 2");
              this.getTurnoActual(this.calibradores[1].id, 2);
            }
          });



        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudieron obtener las líneas del calibrador, método getLineOfCaliper, component monitoreo-calibrador1');
        console.log("No se pudieron cargar las lineas del calibrador!!!!");
      }
    )
  }

  


  fecha() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime;
  }

  //calendar
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  //Método que obtiene el turno actual, en el cual se obtiene la fecha y la hora de inicio de turno 
  /*getTurnoActual() {
    this.monitoreoService.getLastTurno().subscribe(
      res => {
        console.log(res);
        if (res.status == 200) {
          this.turnoActual = res.body;
          
        } else if (res.status == 204) {
          this.toastr.success('no hay turnos actualmente para mostrar', 'Operación satisfactoria');
        }

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo');
        this.toastr.error('error al cargar el turno.');

      }
    )
  }*/

  /****************************************************************************************************************/
  /****************************************************************************************************************/
  /*getRegistro() {
    this.turnoService.getTurnoSinId().subscribe(
      res => {
        this.turno = res;
        if (this.turno) {
          console.log(this.turno.id);
          this.sesionIniciada();
          this.getTurnoActual();
          this.toastr.info("Turno se encuentra iniciado", "Información", {
            positionClass: 'toast-bottom-right'
          });
        } else {
          this.toastr.info("Favor inicie turno", "Información", {
            positionClass: 'toast-bottom-right'
          });
        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el registro del turno, método getRegistro, component monitoreo');
        this.toastr.info('No se ha iniciado turno', 'Información', {
          positionClass: 'toast-bottom-right'
        });
        this.open(this.modalIniciarTurno);
      }
    )
  }*/

  //metodo que abre un modal
  /*open(modal) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  //metodo que sirve para saber la razon por la cual un modal fue cerrado
  private getDismissReason(reason: any): string {
    console.log(reason);
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      console.log("sera");
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }*/

  //metodo que sirve para saber la razon por la cual un modal fue cerrado
  /*private getDismissReasonForm(reason: any) {
    console.log(reason);
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      console.log("sera");
      return 'by clicking on a backdrop';
    } else {
      if (reason == 'ok') {
        if (this.turnoIniciado === false) {
          return this.iniciarTurno();
        } {
          return this.cerrarTurno();
        }
      }
    }
  }*/
  /*autenticarTurno(modal) {
    console.log(this.rutAdmin, this.passAdmin);
    this.openModal(modal);
  }*/

  /*private iniciarTurno() {
    this.administradorService.getLoginAdministrador(this.rutAdmin, this.passAdmin).subscribe(
      res => {
        console.log(JSON.parse(localStorage.getItem('USER')));
        let administrador = JSON.parse(localStorage.getItem('USER'));
        console.log(administrador.id);
        let turno = new Turno();
        let fecha = this.fecha();
        turno.fechaApertura(null, fecha.substring(0, 10), fecha.substring(11, 19), administrador.id, administrador.nombre, administrador.apellido, "", "", "", "", "");
        this.turnoService.saveTurno(turno).subscribe(
          res => {
            this.sesionIniciada();
            this.toastr.success("Turno iniciado correctamente");
            this.registroService.creaRegistro("Turno iniciado");
            //*************** carga el turno guardado ****************
            this.getTurnoActual();
            //guardo los datos del turno iniciado
            this.fechaInicioTurno = fecha.substring(0, 10);
            this.horaInicioTurno = fecha.substring(11, 19);
          },
          err => {
            this.registroDevService.creaRegistroDev('No se crear el registro de iniciar turno, método iniciarTurno, component monitoreo');
            this.toastr.error('Error al iniciar turno', 'Error');
          }
        );
      },
      err => {
        this.registroDevService.creaRegistroDev('Credenciales inválidas para crear el registro de inicio de turno, método iniciarTurno, component monitoreo');
        this.toastr.error('Credenciales inválidas', 'Error');
      }
    )
    this.rutAdmin = "";
    this.passAdmin = "";
  }*/

  /*sesionIniciada() {
    this.botonIniciarTurnoClass = "btn-outline-danger"
    this.botonIniciarTurnoText = "Cerrar Turno";
    this.turnoIniciado = true;
    this.IniciarCerrar = "Cerrar";
    this.iniciarCerrar = "cerrar";
  }

  sesionCerrada() {
    this.botonIniciarTurnoClass = "btn-primary"
    this.botonIniciarTurnoText = "Iniciar Turno";
    this.turnoIniciado = false;
    this.IniciarCerrar = "Iniciar";
    this.iniciarCerrar = "iniciar";
  }*/

  /*private cerrarTurno() {
    this.administradorService.getLoginAdministrador(this.rutAdmin, this.passAdmin).subscribe(
      res => {
        let administrador = JSON.parse(localStorage.getItem('USER'));
        let turno: Turno = new Turno();
        turno.id = this.turno.id;
        turno.fecha_apertura = this.turno.fecha_apertura;
        turno.nombre_administrador_apertura = this.turno.nombre_administrador_apertura;
        turno.apellido_administrador_apertura = this.turno.apellido_administrador_apertura;
        let fecha = this.fecha();
        turno.fechaCierre(fecha.substring(0, 10), fecha.substring(11, 19), administrador.id, administrador.nombre, administrador.apellido);
        this.turnoService.updateTurno(this.turno.id, turno).subscribe(
          res => {
            this.sesionCerrada();
            this.cerrarTurnoColaboradores();
            this.registroService.creaRegistro("Turno cerrado");
            //se borran los datos del turno que estaba abierto
            this.fechaInicioTurno = null;
            this.horaInicioTurno = null;
          },
          err => {
            this.registroDevService.creaRegistroDev('No se pudo crear el registro de cerrar turno, método cerrarTurno, component monitoreo');
            this.toastr.error('Error al cerrar turno', 'Error');
          }
        );
      },
      err => {
        this.registroDevService.creaRegistroDev('Credenciales inválidas para crear el registro cerrar turno, método cerrarTurno, component monitoreo');
        this.toastr.error('Credenciales inválidas', 'Error');
      }
    )
    this.rutAdmin = "";
    this.passAdmin = "";
  }*/

  /*cerrarTurnoColaboradores() {
    let fecha = this.fecha();
    this.turnoService.closeTurnCollaborators(fecha.substring(0, 10), fecha.substring(11, 19)).subscribe(
      res => {
        this.sesionCerrada();
        if (res.status == 200) {
        } else if (res.status == 204) {
          this.toastr.success('No hay colaboradores agregados a linea para cerrar el turno', 'Operación satisfactoria');
          return;
        }

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo cerrar turno a los colaboradores, método cerrarTurnoColaboradores, component monitoreo');
        this.toastr.error('Error al cerrar turno para los colaboradores', 'Error');
      }
    );
  }*/

  /*openModal(modal) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
      console.log(this.rutAdmin, this.passAdmin);
      this.closeResult = `Dismissed ${this.getDismissReasonForm(reason)}`;
    });
  }*/




}
