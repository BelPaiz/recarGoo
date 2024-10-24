import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { NavigationEnd, Router } from '@angular/router';
import { AuthenService } from '../services/authen.service';
import { CreditsService } from '../services/credits.service';
import { QrScannerService } from '../services/qr-scanner.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InicioPage implements OnInit {
  cargaExitosa: boolean = false;
  cargaFallida: boolean = false;


  ocultar:boolean = false;
  mostrar:boolean = false;
  usuario:any;
  mostrarUser:boolean = false;
  dropdownOpen:boolean = false;

  constructor(private router: Router,
    public qrScanner: QrScannerService,
    public servicioCreditos: CreditsService,
    private auth:AuthenService) { }

  ngOnInit() {
    this.auth.DatosAutenticacion().subscribe({
      next: (email) => {
        if(email){
          this.usuario = email;
          this.mostrarUser = !!email;
        }
        else{
          this.usuario = email;
          this.mostrarUser = !!email;
        }
        this.ocultar = !!email;
        // this.mostrarS = !!email;
      },
      error: (error) => {
        console.error(error);
      }
    });
    this.router.events.subscribe(e => {
      if(e instanceof NavigationEnd){
        this.mostrar = false;
      }
    })
  }
  cerrarSesion(){
    this.auth.CerrarSesion().then(() => {
      this.router.navigate(['/login']);
    })
    .catch(e => console.log(e));
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  scan(){
    this.qrScanner.scanQRcode()
    .then((code) => {
      this.servicioCreditos.cargarCredito(code)
      .then(
        (res) => {
          // FLAGS PARA MENSAJES
          this.cargaExitosa = res;
          this.cargaFallida = !res;
          setTimeout(() => {
            // FLAGS PARA MENSAJES
            this.cargaExitosa = false;
            this.cargaFallida = false;
          }, 4000);
      });
    });
  }
}
