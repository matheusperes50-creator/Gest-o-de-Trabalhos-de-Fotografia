
export enum ShootStatus {
  SCHEDULED = 'Agendado',
  PERFORMED = 'Realizado',
  EDITING = 'Editando',
  DELIVERED = 'Entregue'
}

export enum ShootType {
  CASAMENTO = 'Casamento',
  FESTA_INFANTIL = 'Festa Infantil',
  CORPORATIVO = 'Corporativo',
  PRE_WEDDING = 'Pre-Wedding',
  PORTRAIT = 'Retrato',
  EVENTO = 'Evento',
  FORMATURA = 'Formatura'
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
}

export interface Shoot {
  id: string;
  clientId: string;
  type: ShootType;
  status: ShootStatus;
  shootDate: string;
  deliveryDate: string;
  publicationDate: string;
  notes: string;
  price: number;
  location: string; // Novo campo
}

export interface AIAdvice {
  instagramCaption: string;
  reelIdeas: string[];
  checklist: string[];
}
