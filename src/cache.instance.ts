import {
  CacheLayerInterface,
  CacheServiceConfigInterface
} from './cache.interfaces';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { filter, map, timeoutWith, skip } from 'rxjs/operators';

const FRIENDLY_ERROR_MESSAGES = {
  MISSING_OBSERVABLE_ITEM: `is missing from the layer misspelled name ? as soon as you provide correct name value will be emitted!`
};

export class CacheLayerInstance<T = {}> {
  public items: BehaviorSubject<Array<T>> = new BehaviorSubject([]);
  public name: string;
  public config: CacheServiceConfigInterface;
  public createdAt: number;
  private map: Map<string, any> = new Map();
  static createCacheParams(config: { key: string; params: any }) {
    // const params = { key: config, params: PARAMS };
    if (config.params.constructor === Object) {
      return; // Todo
    } else if (config.constructor === String) {
      return; // Todo
    } else if (config.params.constructor === Number) {
      return; // Todo
    } else if (config.params.constructor === Array) {
      return; // Todo
    }
  }

  constructor(layer: CacheLayerInterface) {
    this.name = layer.name;
    this.config = layer.config;
    this.createdAt = layer.createdAt;
    if (this.config.localStorage) {
      layer.items.forEach(item => this.map.set(item['key'], item));
      if (layer.items.constructor === BehaviorSubject) {
        layer.items = layer.items.getValue() || [];
      }
      this.items.next([...this.items.getValue(), ...layer.items]);
    }
    this.initHook(layer);
  }

  private initHook(layer) {
    if (this.config.cacheFlushInterval) {
      this.onExpireAll(layer);
    }
  }

  private onExpireAll(layer) {
    layer.items.forEach(item => this.onExpire(item['key']));
  }

  private putHook(layerItem): void {
    if (this.config.cacheFlushInterval) {
      this.onExpire(layerItem['key']);
    }
  }

  public get(key: string): T {
    if (this.map.has(key)) {
      return this.map.get(key);
    } else {
      return null;
    }
  }

  public put(layerItem): T {
    this.map.set(layerItem['key'], layerItem);
    const item = this.map.get(layerItem['key']);
    const filteredItems = this.items
      .getValue()
      .filter(i => i['key'] !== layerItem['key']);
    if (this.config.localStorage) {
      localStorage.setItem(
        this.name,
        JSON.stringify({
          createdAt: this.createdAt,
          config: this.config,
          name: this.name,
          items: [...filteredItems, item]
        })
      );
    }

    this.items.next([...filteredItems, item]);
    this.putHook(layerItem);
    return layerItem;
  }

  private onExpire(key: string): void {
    new Observable(observer => observer.next())
      .pipe(
        timeoutWith(this.config.cacheFlushInterval, of(1)),
        skip(1)
      )
      .subscribe(() => this.removeItem(key));
  }

  public removeItem(key: string): void {
    const newLayerItems = this.items
      .getValue()
      .filter(item => item['key'] !== key);
    if (this.config.localStorage) {
      const newLayer: CacheLayerInterface = {
        config: this.config,
        name: this.name,
        items: newLayerItems
      };
      localStorage.setItem(this.name, JSON.stringify(newLayer));
    }
    this.map.delete(key);
    this.items.next(newLayerItems);
  }

  public asObservable(key: string): Observable<T> {
    return this.items.asObservable().pipe(
      filter(() => this.map.has(key)),
      map(() => this.get(key))
    );
  }

  public flushCache(): Observable<boolean> {
    return new Observable(o => {
      this.items.getValue().forEach(i => this.removeItem(i['key']));
      o.next(true);
      o.complete();
    });
  }

  async fetch<K>(http: string, init?: RequestInit, cache = true): Promise<K> {
    if (this.config.localStorage && this.get(http) && cache) {
      return this.get(http)['data'];
    }
    const data: K = await (await fetch(http)).json();
    if (cache) {
      this.put({ key: http, data });
    }
    return data;
  }
}
