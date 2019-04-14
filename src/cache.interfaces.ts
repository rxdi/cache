import { InjectionToken } from '@angular/core';

export interface CacheLayerItem<T> {
  key: string;
  data: T;
}

export class CacheServiceConfigInterface {
  cacheFlushInterval?: number | null = 60 * 60 * 1000;
  localStorage?: boolean;
}

export interface CacheLayerInterface {
  name: string;
  config?: CacheServiceConfigInterface;
  items?: any;
  key?: string;
  createdAt?: number;
}

export const CACHE_MODULE_CONFIG = new InjectionToken<
  CacheServiceConfigInterface
>('module.config');

export const CACHE_MODULE_DI_CONFIG: CacheServiceConfigInterface = {
  cacheFlushInterval: 60 * 60 * 1000
};
