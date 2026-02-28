export enum RolesUser {
  user = 'user',
  master = 'master',
  admin = 'admin',
}

export enum StatusMaster {
  active = 'принимает',
  paused = 'временно не принимает',
  banned = 'заблокирован',
}

export enum StatusBokings {
  pending = 'ожидает',
  confirmed = 'подтверждена',
  done = 'завершена',
  cancelled = 'отменена',
}

export enum CancelledBy {
  client = 'client',
  master = 'master',
  admin = 'admin',
}
