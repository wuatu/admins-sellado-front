import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {
  API_URL="http://localhost:3000/api"
  constructor(private httpClient: HttpClient) { }

  getProduccionTotalSearch2(id_caliper: number, id_turno: number, fecha_apertura: string, hora_apertura: string){
    return this.httpClient.get(`${this.API_URL}/monitoreo_produccion_total_turno2/${id_caliper}/${id_turno}/${fecha_apertura}/${hora_apertura}`);
  }
/***********************************************************************************************************************************************************/ 

  getProduccionSearch2(id_caliper: number, id_turno: number, fecha_apertura: string, hora_apertura: string){
    return this.httpClient.get(`${this.API_URL}/monitoreo_produccion_turno2/${id_caliper}/${id_turno}/${fecha_apertura}/${hora_apertura}`);
  }
/***********************************************************************************************************************************************************/

/***********************************************************************************************************************************************************/

  getAverageforMinute2(id_caliper: number, id_turno: number, fecha_apertura: string, hora_apertura: string){
    return this.httpClient.get(`${this.API_URL}/monitoreo_produccion_minuto2/${id_caliper}/${id_turno}/${fecha_apertura}/${hora_apertura}`);
  }
/***********************************************************************************************************************************************************/

/***********************************************************************************************************************************************************/

  getAverageforMinuteLastHour2(id_caliper: number, id_turno: number, fecha_apertura: string, hora_apertura: string){
    return this.httpClient.get(`${this.API_URL}/monitoreo_produccion_minuto_ultima_hora2/${id_caliper}/${id_turno}/${fecha_apertura}/${hora_apertura}`);
  }
/***********************************************************************************************************************************************************/
  

  getLastTurno(fk_calibrador:number){
    return this.httpClient.get(`${this.API_URL}/monitoreo_last_turno/${fk_calibrador}`,{observe: 'response'});
  }

  getActualTurnoCalibradores(){
    return this.httpClient.get(`${this.API_URL}/monitoreo_Actual_turno_calibradores/`,{observe: 'response'});
  }
  

}
