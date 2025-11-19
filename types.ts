export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  walletBalance: number;
  createdAt: string;
  isActive: boolean;
}

export enum Network {
  MTN = 'YELLO', // Mapping generic to Datamart specific
  TELECEL = 'TELECEL',
  AT = 'AT_PREMIUM'
}

export interface DataPackage {
  id: string;
  network: Network;
  name: string;
  capacity: string; // e.g., "10GB"
  datamartPrice: number; // Cost from provider
  adminPrice?: number; // Custom price set by admin (optional override)
  isActive: boolean;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  BONUS = 'BONUS'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  reference: string; // Paystack ref or Datamart ref
  status: TransactionStatus;
  description: string;
  date: string;
  metadata?: any;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyMasked: string;
  createdAt: string;
  lastUsed?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}