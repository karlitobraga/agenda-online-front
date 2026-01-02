export interface ILoginResponse {
  token: String,
  ExpiresAt: Date,
  tenantId: string
}

export interface IRole {
  id: string;
  name: string;
}

export interface IOffering {
  id: string;
  tenantId: string;
  name: string;
  executionTime: number;
  price?: number;
}

export interface IDayWeek {
  id: string;
  tenantId: string;
  day: string;
  start: string; // TimeSpan → string (ex: "08:00:00")
  end: string;   // TimeSpan → string
  dayOff: boolean;
}

export interface ISpecialDay {
  id: string;
  tenantId: string;
  date: Date;
  isDayOff: boolean;
  start?: string; // TimeSpan → string
  end?: string;   // TimeSpan → string
}

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  phoneNumber: string;
  password: string;
  email?: string;
  roles: IRole[];
  offerings: IOffering[];
  daysWeek: IDayWeek[];
  specialDays: ISpecialDay[];
  completedConfiguration: boolean;
  subscriptionExpiryDate?: Date;
}

export interface ITenantCreateRequest {
  phoneNumber: string;
  password: string;
  businessName: string;
}
