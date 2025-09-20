
export interface PerfilUsuario {
  nombre: string;
  email: string;
  paginaWeb: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface ClientePotencial {
  nombreEmpresa: string;
  paginaWeb: string;
  contacto: {
    nombre: string;
    cargo: string;
    email: string;
  };
  analisisNecesidad: string;
}

export interface EmailGenerado {
  id: string;
  destinatario: ClientePotencial;
  servicio: Servicio;
  cuerpo: string;
  fecha: string;
}
