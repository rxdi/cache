import 'jest';
import 'isomorphic-fetch';
import { CacheService } from './cache.service';
import { map, take } from 'rxjs/operators';

describe('User Queries Controller', () => {
  let cache: CacheService = new CacheService({});

  it('should get item from collection asObservable', done => {
    const peshoLayer = cache.create({ name: 'pesho-layer1' });
    peshoLayer.put({ key: 'pesho', data: 'agrarshtina' });
    peshoLayer.items
      .asObservable()
      .pipe(map(i => i[0].data))
      .subscribe(pesho => {
        expect(pesho).toBe('agrarshtina');
        done();
      });
  });

  it('should get specific item sync', done => {
    const peshoLayer = cache.create({ name: 'pesho-layer2' });
    peshoLayer.put({ key: 'pesho2', data: 'agrarshtina2' });
    const item = peshoLayer.get('pesho2');
    expect(item.data).toBe('agrarshtina2');
    done();
  });

  it('should get specific item async via asObservable method', done => {
    const peshoLayer = cache.create({ name: 'pesho-layer3' });
    const item = peshoLayer.asObservable('pesho3');
    item.subscribe(stream => {
      expect(stream.key).toBe('pesho3');
      expect(stream.data).toBe('agrarshtina3');
      done();
    });
    peshoLayer.put({ key: 'pesho3', data: 'agrarshtina3' });
  });

  it('should make request via fetch and return result should be Stradivario', async () => {
    const peshoLayer = cache.create({ name: 'pesho-layer4' });
    const item = await peshoLayer.fetch<{ author: { login: string } }[]>(
      'https://api.github.com/repos/rxdi/core/releases'
    );
    expect(item[0].author.login).toBe('Stradivario');
  });

  it('should flush cache', async () => {
    const peshoLayer = cache.create({ name: 'pesho-layer5' });
    peshoLayer.put({ key: '1', data: { edno: 1 } });
    await peshoLayer.flushCache().toPromise();
    expect(peshoLayer.items.getValue().length).toBe(0);
  });

  it('should add cache layer to local storage', async () => {
    let cache: CacheService = new CacheService({ localStorage: true });
    const peshoLayer = cache.create({ name: 'pesho-layer6' });
    peshoLayer.put({ key: '1', data: { edno: 1 } });
    const localStorageLayer = JSON.parse(localStorage.getItem('pesho-layer6'));
    expect(localStorageLayer.items[0].key).toBe('1');
    expect(localStorageLayer.items[0].data.edno).toBe(1);
  });

  it('should add cache layer to local storage and emit value when local storage is changed', done => {
    let cache: CacheService = new CacheService({ localStorage: true });
    const peshoLayer = cache.create<{ dve: number }>({ name: 'pesho-layer7' });
    peshoLayer
      .asObservable('1')
      .pipe(take(1))
      .subscribe(res => {
        expect(res.key).toBe('1');
        expect(res.data.dve).toBe(2);
        done();
      });
    peshoLayer.put({ key: '1', data: { dve: 2 } });
  });

  it('should flush global cache layers', done => {
    let cache: CacheService = new CacheService({ localStorage: true });
    const peshoLayer = cache.create<{ dve: number }>({ name: 'pesho-layer8' });
    peshoLayer
      .asObservable('1')
      .pipe(take(1))
      .subscribe(res => {
        expect(res.key).toBe('1');
        expect(res.data.dve).toBe(2);
      });
    peshoLayer.put({ key: '1', data: { dve: 2 } });
    cache
      .flushCache()
      .pipe(take(1))
      .subscribe(() => {
        expect(cache.cachedLayers.getValue().length).toBeTruthy();
        done();
      });
  });

  it('should flush global cache layers force', done => {
    let cache: CacheService = new CacheService({ localStorage: true });
    const peshoLayer = cache.create<{ dve: number }>({ name: 'pesho-layer9' });
    peshoLayer
      .asObservable('1')
      .pipe(take(1))
      .subscribe(res => {
        expect(res.key).toBe('1');
        expect(res.data.dve).toBe(2);
      });
    peshoLayer.put({ key: '1', data: { dve: 2 } });
    cache
      .flushCache(true)
      .pipe(take(1))
      .subscribe(() => {
        expect(cache.cachedLayers.getValue().length).toBe(0);
        done();
      });
  });
});
