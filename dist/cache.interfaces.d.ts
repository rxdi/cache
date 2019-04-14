import { InjectionToken } from '@angular/core';
export interface CacheLayerItem<T> {
    key: string;
    data: T;
}
export declare class CacheServiceConfigInterface {
    cacheFlushInterval?: number | null;
    localStorage?: boolean;
}
export interface CacheLayerInterface {
    name: string;
    config?: CacheServiceConfigInterface;
    items?: any;
    key?: string;
    createdAt?: number;
}
export declare const CACHE_MODULE_CONFIG: InjectionToken<CacheServiceConfigInterface>;
export declare const CACHE_MODULE_DI_CONFIG: CacheServiceConfigInterface;
