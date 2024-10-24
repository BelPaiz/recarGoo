import { Injectable } from '@angular/core';
import { FirestoreService } from './firebase/firestore.service';
import { orderBy, Timestamp, where } from '@angular/fire/firestore';
import { AuthenService } from './authen.service';

export interface Credito {
  usuario: string,
  codigo_qr: string,
  creditos: number,
  fecha: Timestamp
}

export interface Codigo {
  codigo: string,
  creditos: number,
}


@Injectable({
  providedIn: 'root'
})
export class CreditsService {
  private readonly table: string = 'creditos';
  private readonly codigos: Codigo[] = [
    { codigo: '8c95def646b6127282ed50454b73240300dccabc' , creditos: 10 },
    { codigo: 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172 ' , creditos: 50 },
    { codigo: '2786f4877b9091dcad7f35751bfcf5d5ea712b2f' , creditos: 100 },
  ];
  private readonly qr_codes: string[] = this.codigos.map((c) => { return c.codigo });
  public creditos: Credito[] = [];


  constructor(
    private firestoreService: FirestoreService,
    private session: AuthenService
  ) {
    this.fetchAll();
  }


  async cargarCredito(codigo: string): Promise<boolean> {
    let cargado: boolean = false;

    if (this.qr_codes.includes(codigo)){
      let cargas: number = this.cantidadDeCargas(this.session.getCurrentUser(), codigo);

      if (cargas == 0 || (cargas <= 1 && this.session.isAdmin())){
        let credito: Credito = {
          usuario: this.session.getCurrentUser(),
          codigo_qr: codigo,
          creditos: this.codigos.filter((c) => { return c.codigo == codigo })[0].creditos,
          fecha: new Date() as unknown as Timestamp
        };

        await this.pushOne(credito);
        cargado = true;
      }
    }

    return cargado;
  }

  public cantidadDeCargas(usuario: string, codigo: string): number {
    return this.creditos.filter((c) => { return c.usuario == usuario && c.codigo_qr == codigo }).length;
  }

  public cargasUsuarioActivo(): Credito[] {
    return this.creditos.filter((c) => { return c.usuario == this.session.getCurrentUser() }).splice(0, 5);
  }

  private async pushOne(credito: Credito): Promise<void> {
    this.firestoreService.pushOne(this.table, credito);
  }

  public async deleteCreditos(){
    this.firestoreService.deleteMany(this.table, where('usuario', '==', this.session.getCurrentUser()));
  }

  private async fetchAll(): Promise<void> {
    this.firestoreService.fetchAll(this.table, orderBy('fecha', 'desc'))
    .subscribe((res) => {
      let creditos = res as Credito[];
      this.creditos = creditos.filter((c) => { return c.usuario == this.session.getCurrentUser() })
    });
  }

  consultarCreditos(): number {
    return this.creditos.filter((c) => { return c.usuario == this.session.getCurrentUser() }).reduce((a,b) => { return a + b.creditos }, 0);
  }
}
