import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbCalendar, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { AdministradorService } from 'src/app/services/administrador.service';
import { TurnoService } from 'src/app/services/turno.service';
import { Turno } from 'src/app/models/turno';
import { RegistroService } from '../../services/registro.service';
import { CalibradorService } from '../../services/calibrador.service';
import { MonitoreoService } from '../../services/monitoreo.service';
import { MonitoreoCalibradoresService } from '../../services/monitoreo-calibradores.service';
import { RegistroDevService } from '../../services/registro-dev.service';
// GRAFICO
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label, Color } from 'ng2-charts';
import { LineaService } from 'src/app/services/linea.service';


//*****/
import { timer, interval, Subscription, Observable } from 'rxjs';
import { GetDateService } from 'src/app/services/get-date.service';
import { MenubarService } from 'src/app/services/menubar.service';


@Component({
  selector: 'app-monitoreo-calibrador2',
  templateUrl: './monitoreo-calibrador2.component.html',
  styleUrls: ['./monitoreo-calibrador2.component.css']
})
export class MonitoreoCalibrador2Component implements OnInit {
  @ViewChild("mymodaliniciarturno") modalIniciarTurno: ElementRef;
  time = new Date();

  calibradores: any = [];
  lineas: any = [];
  
  cajasTotalCalibrador2Turno: any = [];

  cajasCalibrador2Turno: any = [];
  cajasCalibrador2Hora: any = [];
  cajasCalibrador2Minuto: any = [];

  totalBoxCaliper2: number = 0;
  totalTurno2: number = 0;
  totalHora2: number = 0;
  totalMinuto2: number = 0;

  fechaActual: string;
  arrayAux: any = [];
  turnoActual: any = [];
  productionByLine: any = [];

  //calendar
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  isBusqueda = false;
  desde: string = "";
  hasta: string = "";
  nombreCalibrador: string = "";

  subscriptionTimerTask: Subscription;
  subscriptionTimer: Subscription;
  subscriptionTimerProduccion: Subscription;

  subscriptionTimerVerificarSiSeInicioTurno: Subscription;
  


  constanteDivision = 0;
  barChartOptions: ChartOptions;
  timeOutCaliper2: any;

  /*****************************/
  iniciarCerrar = "iniciar";
  IniciarCerrar = "Iniciar";
  passAdmin = "";
  rutAdmin = "";
  closeResult = "";
  turnoIniciado = false;
  botonIniciarTurnoClass = "btn-primary";
  botonIniciarTurnoText = "Iniciar turno";
  turno;
  fechaInicioTurno: string = null;
  horaInicioTurno: string = null;
  /*****************************/

  offsetTime: any;

  isDisabled = true;

  rol: number;

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
    private lineaService: LineaService,
    private monitoreoCalibradorService: MonitoreoCalibradoresService,
    private registroDevService: RegistroDevService,
    private getDateService: GetDateService,
    private menuBar: MenubarService
  ) {
    this.fromDate = calendar.getToday();
    this.desde = formatDate(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day), "dd-mm-yyyy", 'en-US');
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
    this.rol = JSON.parse(localStorage.getItem('USER')).rol;
    
    //Lista los calibradores que estan registrados en la base de datos.
    //this.getTurnoActual();
    this.listarCalibradores();
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

  ngAfterViewInit(): void {
    this.isLoggedIn();
  }

  isLoggedIn(): void {
    if (this.authService.isLogin()) {
      const user = JSON.parse(localStorage.getItem('USER'));
      console.log(user.rut);
      if (user.rut == "22222222-2") {
        let showmenu: HTMLElement = document.getElementById('showmenu') as HTMLElement;
        showmenu.click();
        let botom: HTMLElement = document.getElementById('scrollMe2') as HTMLElement;
        botom.scrollIntoView();
      }
    }
  }

  ngOnDestroy() {
    //console.log("ngOnDestroy 2");
    if (this.timeOutCaliper2 != null) {
      //console.log("muerte a timeOutCaliper2.....");
      clearTimeout(this.timeOutCaliper2);
    }

    if (this.subscriptionTimer != null) {
      //console.log("muerte a subscriptionTimer.....");
      this.subscriptionTimer.unsubscribe();
    }

    if (this.subscriptionTimerProduccion != null) {
      console.log("muerte a subscriptionTimeProduccion 2.....");
      this.subscriptionTimerProduccion.unsubscribe();
    }


  }

  verificarSiSeInicioTurno(){
    console.log("verificando!!!!!");
    this.subscriptionTimerVerificarSiSeInicioTurno = timer(0, 5000).subscribe(() => {
      this.monitoreoService.getLastTurno(this.calibradores[1].id).subscribe(
        res => {
          if (res.status == 200) {
  
            if (res.body[0].fecha_cierre == "") {
              this.listarCalibradores();
              if (this.subscriptionTimerVerificarSiSeInicioTurno != null) {
                console.log("muerte a subscriptionTimeVerificarSiSeInicioTurno 2.....");
                this.subscriptionTimerVerificarSiSeInicioTurno.unsubscribe();
              }
            }
  
          }
        },
        err => {
          console.log(err.status);
          this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo');
        }
      )
    });
  }

  //Método que elimina los registros de la tabla registro_diario_caja_sellada_aux correspondiente al turno actual
  getDeleteRegister() {
    this.monitoreoCalibradorService.deleteRegister(this.turno.id).subscribe(
      res => {
        this.registroService.creaRegistro("Se han eliminado todos los registros del idturno:" + this.turno.id + " de la tabla registro_diario_caja_sellada_aux");

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo eliminar los registros de la tabla registro_diario_caja_sellada_aux, método getDeleteRegister, monitoreo-calibrador.componenet');

      }
    )
  }

  getProduccion() {
    this.monitoreoService.getLastTurno(this.calibradores[1].id).subscribe(
      res => {
        if (res.status == 200) {

          if (res.body[0].fecha_cierre == "") {
            this.getAverageforMinute2()
          }

        }
      },
      err => {
        console.log(err.status);
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo');
      }
    )
  }

  //metodo que lista las calibradores
  listarCalibradores() {
    this.calibradorService.getCalibradores().subscribe(
      res => {
        this.calibradores = res.body;
        if (this.calibradores.length > 1) {
          this.getRegistro();

          this.constanteDivision = (this.calibradores[1].cajas_por_minuto / 3);

        }
        /******************************** GRAFICO ************************************/
        this.barChartOptions = {
          responsive: true,
          // We use these empty structures as placeholders for dynamic theming.
          title: {
            display: true,
            text: '    ',
            fontColor: "black",
            fontSize: 20
          },
          legend: {
            labels: {
              fontSize: 20,
              fontColor: 'red'
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                fontSize: 20,
                fontColor: "black"
              }
            }], yAxes: [{
              ticks: {
                beginAtZero: true,
                autoSkipPadding: 20,
                //max: this.calibradores[1].cajas_por_minuto + 3,
                fontSize: 20,
                fontColor: "black"
              }
            }]
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: "black",
              font: {
                size: 20,
              }
            },
          }
        };


      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudieron obtener los calibradores, método listarCalibradores, component monitoreo-calibrador2');
        this.toastr.error('No se pudo obtener calibradores', 'Oops');
      }
    );
  }
  //Este método obtiene desde la base de datos todas las lineas que tiene el calibrador y ejecuta los métodos paras obtener la producción 
  getLineOfCaliper() {
    this.lineaService.getLineasId(this.calibradores[1].id).subscribe(
      res => {
        this.lineas = res.body;
        if (this.lineas != null) {
          this.subscriptionTimerProduccion = timer(0, 10000).subscribe(() => {
            this.monitoreoService.getLastTurno(this.calibradores[1].id).subscribe(
              res => {
                if (res.status == 200) {

                  if (res.body[0].fecha_cierre == "") {
                    if(this.botonIniciarTurnoText == "Iniciar Turno"){
                      if (this.subscriptionTimerProduccion != null) {
                        console.log("muerte a subscriptionTimeProduccion 2.....");
                        this.subscriptionTimerProduccion.unsubscribe();
                      }
                      this.listarCalibradores();
                    }
                    console.log("ejecutando produccion 2..!!!!!");
                    console.log(res.body[0]);
                    this.getAverageforMinute2();
                    this.getProduccionTurno2();
                    this.getAverageLastHour2();
                    this.getProductionLine2();
                    this.getProduccionTotalTurno2();
                  }else if(res.body[0].fecha_cierre != ""){
                    this.noExisteTurno();
                  }

                }else if(res.status == 204){
                  console.log("res.status == 204");
                  this.noExisteTurno();
                }
              },
              err => {
                console.log(err.status);
                this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo');
              }
            )
          });
          this.getAverageforMinute2();
        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudieron obtener las líneas, método getLineOfCaliper, component monitoreo-calibrador2');
        console.log("No se pudieron cargar las lineas del calibrador!!!!");
      }
    )
  }

  noExisteTurno(){
    this.cajasCalibrador2Minuto = [];
    this.cajasCalibrador2Turno = [];
    this.cajasCalibrador2Hora = [];
    this.productionByLine = [];
    this.barChartData[0].data = [];
    this.barChartLabels = [];
    this.totalHora2 = 0;
    this.totalMinuto2 = 0;
    this.totalTurno2 = 0;
    this.sesionCerrada();
  }

  ordenarArray(array = new Array()) {
    this.arrayAux = [];
    for (let linea of this.lineas) {
      for (let arr of array) {
        if (linea.nombre == arr.nombre_linea) {
          this.arrayAux.push(arr);
          break;
        }
      }
    }
    this.pushData(this.arrayAux);

  }

  //Método que obtiene desde la base de datos el turno que se encuentra iniciado
  getTurnoActual() {
    this.monitoreoService.getLastTurno(this.calibradores[1].id).subscribe(
      res => {
        this.turnoActual = res.body;
        //this.listarCalibradores();

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el turno actual, método getTurnoActual, component monitoreo-calibrador2')
        console.log("el turno no se pudo cargar!");
      }
    )
  }


  /******************************************************************************************************/
  /*******************************************   PRODUCCIÓN   *******************************************/
  /******************************************************************************************************/
  //Método que obtiene la cantidad de cajas selladas por minuto de las lineas del calibrador 
  getProductionLine2() {
    this.productionByLine = [];
    //fecha atual, se utiliza para saber si el turno se mantiene en el dia de inicio o paso a otro.
    this.fechaActual = this.fecha().substring(0, 10);
    let i = 0;
    for (let linea of this.lineas) {
      this.monitoreoCalibradorService.getProductionLine2(this.calibradores[1].id, this.turnoActual.id, this.turnoActual.fecha_apertura, this.turnoActual.hora_apertura, linea.id, linea.nombre).subscribe(
        res => {
          this.productionByLine.push(res.body);

          if (i == this.lineas.length - 1) {
            this.ordenarArray(this.productionByLine);
            /*this.timeOutCaliper2 = setTimeout(() => {
              this.getProduccion();
            },
              10000);*/
          }
          i++;
        },
        err => {
          this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto en el turno del calibrador 1, método getProductionLinea, component monitoreo-calibrador1');
          console.log("no se obtuvo la producción de la linea ");
        }
      )
    }
  }


  getAverageforMinute2() {
    //console.log("getAverageForMinute2  calibrador 2");
    this.monitoreoCalibradorService.getAverageforMinute2(this.calibradores[1].id, this.turnoActual.id, this.turnoActual.fecha_apertura, this.turnoActual.hora_apertura, this.lineas.length).subscribe(
      res => {
        this.cajasCalibrador2Minuto = res;

        //this.getProduccionTurno2();

        //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
        if (this.cajasCalibrador2Minuto[0].total == null || this.cajasCalibrador2Minuto[0].total == "NaN") {
          this.totalMinuto2 = 0;
        }
        else {
          this.totalMinuto2 = this.cajasCalibrador2Minuto[0].total;
        }


      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto en el turno del calibrador 1, método getAverageforMinute, component monitoreo-calibrador1');
        this.toastr.error('NO obtenido', 'NO obtenido');
      }
    )
  }

  getAverageLastHour2() {
    //get todas las cajas que tengan el mismo id del turno
    this.monitoreoCalibradorService.getAverageforMinuteLastHour2(this.calibradores[1].id, this.turnoActual.id, this.turnoActual.fecha_apertura, this.turnoActual.hora_apertura, this.lineas.length).subscribe(
      res => {
        this.cajasCalibrador2Hora = res;

        //this.getProductionLine2();
        //if para dejar en el contador de minutos en el caso de que se inicie el turno y aun no transcurra el primer minuto
        if (this.cajasCalibrador2Hora[0].total == null || this.cajasCalibrador2Hora[0].total == "NaN") {
          this.totalHora2 = 0;
        }
        else {
          this.totalHora2 = this.cajasCalibrador2Hora[0].total;
        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto en la última hora en el turno del calibrador 1, método getAverageLastHour, component monitoreo-calibrador1');
        this.toastr.error('Promedio de la ultima hora por minuto NO obtenido', 'NO obtenido');
      });
  }

  //Método que ejecuta los servicios para consultar el promedio de cajas selladas del turno.
  getProduccionTurno2() {
    //consulta para el calibrador 1
    this.monitoreoCalibradorService.getProduccionSearch2(this.calibradores[1].id, this.turnoActual.id, this.turnoActual.fecha_apertura, this.turnoActual.hora_apertura).subscribe(
      res => {
        this.cajasCalibrador2Turno = res;
        this.totalTurno2 = this.cajasCalibrador2Turno[0].total;

        //this.getAverageLastHour2();
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el promedio de cajas por minuto en el turno del calibrador 1, método getProduccionTurno, component monitoreo-calibrador1');
        this.toastr.error('NO obtenidoaaa', 'NO obtenido');
      }
    )

  }

  getProduccionTotalTurno2() {
    //consulta para el calibrador 1
    this.monitoreoCalibradorService.getProduccionTotalSearch2(this.calibradores[1].id, this.turnoActual.id, this.turnoActual.fecha_apertura, this.turnoActual.hora_apertura).subscribe(
      res => {
        this.cajasTotalCalibrador2Turno = res;
        this.totalBoxCaliper2 = this.cajasTotalCalibrador2Turno[0].total;

  
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el total de cajas en el turno del calibrador 1, método getProduccionTotalTurno, component monitoreo-calibrador1');
        this.toastr.error('NO obtenido', 'NO obtenido');
      }
    )

  }

  /******************************************************************************************************/
  /******************************************************************************************************/
  /******************************************************************************************************/

  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Producción por linea' + this.nombreCalibrador }//,
    //{ data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  public barChartColors: Color[] = [
    {
      backgroundColor: 'rgba(39, 0, 235, 0.49)',
    },

  ]

  pushData(dataNumberBox: any[]) {
    this.barChartData[0].data = [];
    this.barChartData[0].backgroundColor = [];
    this.barChartLabels = [];
    let i = 0;
    for (let data of dataNumberBox) {
      //console.log(data);
      if (data.total <= this.constanteDivision) {
        this.barChartData[0].data.push(data.total);
        this.barChartData[0].backgroundColor.push("red");
      } else if (data.total > this.constanteDivision && data.total <= this.constanteDivision * 2) {
        this.barChartData[0].data.push(data.total);
        this.barChartData[0].backgroundColor.push("yellow");
      } else {
        this.barChartData[0].data.push(data.total);
        this.barChartData[0].backgroundColor.push("green");
      }
      this.barChartLabels.push(`${data.nombre_linea}` + " [" + data.total_turno + " cajas]");
      i++;
    }

  }

  /*****************************************************************************/


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

  /************ GRAFICO ***************/
  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    this.barChartData[0].data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100),
      56,
      (Math.random() * 100),
      40];
  }
  /********************************/


  /****************************************************************************************************************/
  getRegistro() {
    this.turnoService.getTurnoSinId(this.calibradores[1].id).subscribe(
      res => {
        if (res.status == 200) {

          //console.log("este es el turno que trae");
          this.turno = res.body;
          //console.log(this.turno);
          this.sesionIniciada();
          this.turnoActual = res.body;
          //this.getTurnoActual();
          this.toastr.info("Turno se encuentra iniciado", "Información", {
            positionClass: 'toast-bottom-right'
          });
        } else {
          this.toastr.info("No se ha iniciado turno", "Información", {
            positionClass: 'toast-bottom-right'
          });
          this.isDisabled = false;
          if(this.rol!=2){
            this.open(this.modalIniciarTurno);
          }
        }
      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo obtener el registro del turno, método getRegistro, component monitoreo');
        this.toastr.info('No se ha iniciado turno', 'Información', {
          positionClass: 'toast-bottom-right'
        });
        if(this.rol!=2){
          this.open(this.modalIniciarTurno);
        }
      }
    )
  }

  //metodo que abre un modal
  open(modal) {
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
  }

  //metodo que sirve para saber la razon por la cual un modal fue cerrado
  private getDismissReasonForm(reason: any) {
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
  }

  autenticarTurno(modal) {
    console.log(this.rutAdmin, this.passAdmin);
    this.openModal(modal);
  }

  private iniciarTurno() {
    this.administradorService.getLoginAdministrador(this.rutAdmin, this.passAdmin).subscribe(
      res => {
        console.log(JSON.parse(localStorage.getItem('USER')));
        let administrador = JSON.parse(localStorage.getItem('USER'));
        console.log(administrador.id);
        let turno = new Turno();
        let fecha = this.fecha();
        turno.fechaApertura(null, fecha.substring(0, 10), fecha.substring(11, 19), administrador.id, administrador.nombre, administrador.apellido, "", "", "", "", "", this.calibradores[1].id, this.calibradores[1].nombre);
        this.turnoService.saveTurno(turno).subscribe(
          res => {
            if (this.subscriptionTimerProduccion != null) {
              console.log("muerte a subscriptionTimeProduccion 2.....");
              this.subscriptionTimerProduccion.unsubscribe();
            }
            this.getRegistro();
            //this.sesionIniciada();
            this.toastr.success("Turno iniciado correctamente");
            this.registroService.creaRegistro("Turno iniciado");
            //*************** carga el turno guardado ****************
            //this.getTurnoActual();
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
  }

  sesionIniciada() {
    this.getLineOfCaliper();
    this.botonIniciarTurnoClass = "btn-outline-danger"
    this.botonIniciarTurnoText = "Cerrar Turno";
    this.turnoIniciado = true;
    this.IniciarCerrar = "Cerrar";
    this.iniciarCerrar = "cerrar";
    this.isDisabled = false;
  }

  sesionCerrada() {
    console.log("entre a sesionCerrada!!... ");
    this.botonIniciarTurnoClass = "btn-primary"
    this.botonIniciarTurnoText = "Iniciar Turno";
    this.turnoIniciado = false;
    this.IniciarCerrar = "Iniciar";
    this.iniciarCerrar = "iniciar";
    this.isDisabled = false;
    this.fechaInicioTurno = null;
    this.horaInicioTurno = null;
  }

  private cerrarTurno() {
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
            this.getDeleteRegister();
            this.cerrarTurnoColaboradores();
            this.registroService.creaRegistro("Turno cerrado al calibrador 2");
            
          },
          err => {
            this.registroDevService.creaRegistroDev('No se pudo crear el registro de cerrar turno en el calibrador 2, método cerrarTurno, component monitoreo-calibrador2');
            this.toastr.error('Error al cerrar turno', 'Error');
          }
        );
      },
      err => {
        this.registroDevService.creaRegistroDev('Credenciales inválidas para crear el registro cerrar turno, método cerrarTurno, component monitoreo-calibrador2');
        this.toastr.error('Credenciales inválidas', 'Error');
      }
    )
    this.rutAdmin = "";
    this.passAdmin = "";
  }

  cerrarTurnoColaboradores() {
    let fecha = this.fecha();
    this.turnoService.closeTurnCollaborators(fecha.substring(0, 10), fecha.substring(11, 19), this.calibradores[1].id).subscribe(
      res => {
        this.sesionCerrada();
        if (res.status == 200) {
        } else if (res.status == 204) {
          this.toastr.success('No hay colaboradores agregados a línea para cerrar el turno', 'Operación satisfactoria');
          return;
        }

      },
      err => {
        this.registroDevService.creaRegistroDev('No se pudo cerrar turno a los colaboradores, método cerrarTurnoColaboradores, component monitoreo');
        this.toastr.error('Error al cerrar turno para los colaboradores', 'Error');
      }
    );
  }

  openModal(modal) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
      console.log(this.rutAdmin, this.passAdmin);
      this.closeResult = `Dismissed ${this.getDismissReasonForm(reason)}`;
    });
  }



}


