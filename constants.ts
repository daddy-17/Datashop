import { Network, DataPackage } from "./types";

export const APP_NAME = "DataMart Premium";

// Initial Seed Data mimicking Datamart API
export const INITIAL_PACKAGES: DataPackage[] = [
  { id: 'pkg_1', network: Network.MTN, name: 'MTN 1GB', capacity: '1GB', datamartPrice: 10.00, adminPrice: 12.00, isActive: true },
  { id: 'pkg_2', network: Network.MTN, name: 'MTN 5GB', capacity: '5GB', datamartPrice: 45.00, isActive: true }, // No admin price, uses datamart
  { id: 'pkg_3', network: Network.MTN, name: 'MTN 10GB', capacity: '10GB', datamartPrice: 80.00, adminPrice: 95.00, isActive: true },
  { id: 'pkg_4', network: Network.TELECEL, name: 'Telecel 2GB', capacity: '2GB', datamartPrice: 15.00, adminPrice: 18.00, isActive: true },
  { id: 'pkg_5', network: Network.TELECEL, name: 'Telecel Unlimited', capacity: 'UNL', datamartPrice: 300.00, isActive: true },
  { id: 'pkg_6', network: Network.AT, name: 'AT Big Time 5GB', capacity: '5GB', datamartPrice: 25.00, adminPrice: 30.00, isActive: true },
];

export const NETWORK_COLORS = {
  [Network.MTN]: 'bg-yellow-400 text-yellow-900',
  [Network.TELECEL]: 'bg-red-500 text-white',
  [Network.AT]: 'bg-blue-600 text-white',
};