import { RelojPort } from '@orbyta/ping-application';

export class RelojSistema implements RelojPort {
  ahora(): Date {
    return new Date();
  }
}
