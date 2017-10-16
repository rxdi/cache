export interface CacheLayerItem<T> {
    key: string;
    data: T;
}
export declare class CacheServiceConfigInterface {
    deleteOnExpire: string;
    cacheFlushInterval: number;
    maxAge: number;
    localStorage: boolean;
}
export interface CacheLayerInterface {
    layer: string;
    config?: CacheServiceConfigInterface;
    items?: any;
}
