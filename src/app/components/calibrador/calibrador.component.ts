import { Component, OnInit } from '@angular/core';
import { CalibradorService } from 'src/app/services/calibrador.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LineaService } from 'src/app/services/linea.service';
import { NgForm } from '@angular/forms';
import { Calibrador } from 'src/app/models/calibrador';

@Component({
  selector: 'app-calibrador',
  templateUrl: './calibrador.component.html',
  styleUrls: ['./calibrador.component.css']
})
export class CalibradorComponent implements OnInit {

  closeResult = '';
  calibradores: any;
  currentCalibradorSelected: Calibrador

  constructor(
    private calibradorService: CalibradorService, 
    private modalService: NgbModal, 
    private toastr: ToastrService,
  //servicio de linea, contiene los metodos CRUD de lineas
  private lineaService: LineaService) { }

  ngOnInit() {
    this.listarCalibradores();
  }

  //metodo que trae todos los registros de lineas desde la base de datos
  listarCalibradores() {  
    console.log("Holaaa");
    this.calibradorService.getCalibradores().subscribe(
      res => {
        //los registros se almacena en array calibradores que sirve para llenar la tabla de vista lineas
        this.calibradores = res;
      },
      err => {
        if (err.status != 404) {
          console.log(err.status);
          this.toastr.error('No se pudo listar calibradores', 'Oops');
        } else{
          this.calibradores=null;
        }
      }
    )
  }

  //metodo que crea un nuevo calibrador
  agregarCalibrador(form: NgForm) {  
    if (!form.value.nombre) {
      this.toastr.error('No se pudo guardar clibrador', 'Oops');
      return;
    }
    let calibrador = new Calibrador(null, form.value.nombre);
    //calibrador.nombre_selladora=this.selectedSelladoraObject.nombre;
    this.calibradorService.saveCalibrador(calibrador).subscribe(
      res => {
        this.toastr.success('Operación satisfactoria', 'Calibrador agregada');
        this.listarCalibradores();
      },
      err => {
        console.log(err);
        this.toastr.error('No se pudo guardar línea', 'Oops');
      }
    );

  }

  //metodo que se ejecuta al presionar boton editar, sirve para asignar objeto calibrador clickeado a variable global currentLineaSelected
  onEditar(calibrador: Calibrador) {
    this.currentCalibradorSelected = calibrador;
  }

  //metodo que sirve para editar una linea
  editarCalibrador(form: NgForm) {
    console.log(form.value.nombre);
    //console.log(this.selectedSelladoraObject);
    if (!form.value.nombre) {
      this.toastr.error('No se pudo editar línea', 'Oops',);
      return;
    }

    let calibrador = new Calibrador(form.value.id, form.value.nombre);
   
    this.calibradorService.updateCalibrador(calibrador.id, calibrador).subscribe(
      res => {
        this.toastr.success('Operación satisfactoria', 'Calibrador editada');
        console.log(res);
        this.listarCalibradores();
        this.currentCalibradorSelected = null;
      },
      err => {
        console.log(err);
        this.toastr.error('No se pudo editar calibrador', 'Oops',);
      }
    );
  }

  //metodo que se ejecuta al presionar boton eliminar, sirve para asignar objeto linea clickeado a variable global currentLineaSelected y abrir el modal
  onEliminar(calibrador: Calibrador, modal) {
    this.currentCalibradorSelected = calibrador;
    console.log(this.currentCalibradorSelected);
    this.open(modal);
  }

  //metodo que elimina una linea
  eliminarLinea(calibrador: Calibrador) {
    console.log("calibrador.id: " + calibrador.id);
    this.calibradorService.deleteCalibrador(calibrador.id).subscribe(
      res => {
        this.toastr.success('Operación satisfactoria', 'Calibrador eliminado');
        console.log(res);
        this.listarCalibradores();
      },
      err => {
        console.log(err);
        this.toastr.error('No se pudo eliminar calibrador', 'Oops');
      }
    );
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
      if (reason == 'ok') {
        console.log("hola");
        this.eliminarLinea(this.currentCalibradorSelected);
      }
      return `with: ${reason}`;
    }
  }

}

