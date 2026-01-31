
import React from 'react';
import { ShootStatus, ShootType } from './types';

export const STATUS_COLORS: Record<ShootStatus, string> = {
  [ShootStatus.SCHEDULED]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ShootStatus.PERFORMED]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ShootStatus.EDITING]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ShootStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const SHOOT_TYPE_ICONS: Record<ShootType, React.ReactNode> = {
  [ShootType.CASAMENTO]: <i className="fas fa-rings-wedding text-rose-600"></i>,
  [ShootType.FESTA_INFANTIL]: <i className="fas fa-cake-candles text-sky-500"></i>,
  [ShootType.CORPORATIVO]: <i className="fas fa-building-user text-slate-700"></i>,
  [ShootType.PRE_WEDDING]: <i className="fas fa-heart text-rose-400"></i>,
  [ShootType.PORTRAIT]: <i className="fas fa-user-tie text-slate-500"></i>,
  [ShootType.EVENTO]: <i className="fas fa-calendar-star text-indigo-500"></i>,
  [ShootType.FORMATURA]: <i className="fas fa-graduation-cap text-slate-800"></i>,
};
