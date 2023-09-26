import { relayInit, eventsGenerator, type Relay, type Sub, type SubscriptionOptions } from './relay'
import { normalizeURL } from './utils'

import type { Event } from './event'
import { matchFilters, type Filter } from './filter'

type BatchedRequest = {
  filters: Filter<any>[]
  relays: any[]
  resolve: (events: Event<any>[]) => void
  events: Event<any>[]
}

export class SimplePool {
  private _conn: { [url: string]: Relay }
  private _seenOn: { [id: string]: Set<string> } = {} // a map of all events we've seen in each relay
  private batchedByKey: { [batchKey: string]: BatchedRequest[] } = {}

  private eoseSubTimeout: number
  private getTimeout: number
  private seenOnEnabled: boolean = true
  private batchInterval: number = 100

  constructor(
      options: {
        eoseSubTimeout?: number
        getTimeout?: number
        seenOnEnabled?: boolean
        batchInterval?: number
      } = {},
  ) {
    this._conn = {}
    this.eoseSubTimeout = options.eoseSubTimeout || 34000
    this.getTimeout = options.getTimeout || 34000
    this.seenOnEnabled = options.seenOnEnabled !== false
    this.batchInterval = options.batchInterval || 100
  }

  close(relays: any[]): void {
    relays.forEach(({gateway_url, canister_id}) => {
      let relay = this._conn[normalizeURL(gateway_url, canister_id)]
      if (relay) relay.close()
    })
  }

  ensureRelay(
      gateway_url: string,
      canister_actor: any,
      canister_id: string,
      ic_url: string,
      local: boolean,
      persist_key: boolean
  ): Promise<Relay> {
    const nm = normalizeURL(gateway_url, canister_id);

    if (!this._conn[nm]) {
      let options = {
        getTimeout: this.getTimeout * 0.9,
        listTimeout: this.getTimeout * 0.9,
      }
      this._conn[nm] = relayInit(
          gateway_url, canister_actor, canister_id, ic_url, local, persist_key, options
      );
    }
    return this._conn[nm];
  }

  sub<K extends number = number>(relays: any[], filters: Filter<K>[], opts?: SubscriptionOptions): Sub<K> {
    let _knownIds: Set<string> = new Set()
    let modifiedOpts = { ...(opts || {}) }

    modifiedOpts.alreadyHaveEvent = (id, url) => {
      if (opts?.alreadyHaveEvent?.(id, url)) {
        return true
      }
      if (this.seenOnEnabled) {
        let set = this._seenOn[id] || new Set()
        set.add(url)
        this._seenOn[id] = set
      }
      return _knownIds.has(id)
    }

    let subs: Sub[] = []
    let eventListeners: Set<any> = new Set()
    let errorListeners: Set<any> = new Set()
    let eoseListeners: Set<() => void> = new Set()
    let eosesMissing = relays.length

    let eoseSent = false
    let eoseTimeout = setTimeout(
        () => {
          eoseSent = true
          for (let cb of eoseListeners.values()) cb()
        },
        opts?.eoseSubTimeout || this.eoseSubTimeout,
    );

    relays
        .filter((r, i, a) => a.indexOf(r) === i)
        .forEach(async ({gateway_url, canister_actor, canister_id, ic_url, local, persist_key}) => {
          let r;
          try {
            r = this.ensureRelay(gateway_url, canister_actor, canister_id, ic_url, local, persist_key);
            let s;

            r.on("connect", () => {
              s = r.sub(filters, modifiedOpts);
              s.on('event', event => {
                _knownIds.add(event.id as string)
                for (let cb of eventListeners.values()) cb({event, gateway_url, canister_id})
              })
              s.on('eose', (event) => {
                if (eoseSent) return
                handleEose()
              })
              subs.push(s)
            });

            r.on("error", (error) => {
              for (let cb of errorListeners.values()) cb({error, gateway_url, canister_id});
            });

            await r.connect();

          } catch (err) {
            console.error(err);
            handleEose()
            return
          }
          if (!r) return

          function handleEose() {
            eosesMissing--
            if (eosesMissing === 0) {
              clearTimeout(eoseTimeout)
              for (let cb of eoseListeners.values()) cb()
            }
          }
        })

    let greaterSub: Sub<K> = {
      sub(filters, opts) {
        subs.forEach(sub => sub.sub(filters, opts))
        return greaterSub as any
      },
      unsub() {
        subs.forEach(sub => sub.unsub())
      },
      on(type, cb) {
        if (type === 'event') {
          eventListeners.add(cb)
        } else if (type === 'eose') {
          eoseListeners.add(cb as () => void | Promise<void>)
        } else if (type === "error") {
          errorListeners.add(cb);
        }
      },
      off(type, cb) {
        if (type === 'event') {
          eventListeners.delete(cb)
        } else if (type === 'eose') eoseListeners.delete(cb as () => void | Promise<void>)
      },
      get events() {
        return eventsGenerator(greaterSub)
      },
    }

    return greaterSub
  }

  get<K extends number = number>(
      relays: any[],
      filter: Filter<K>,
      opts?: SubscriptionOptions,
  ): Promise<Event<K> | null> {
    return new Promise(resolve => {
      let sub = this.sub(relays, [filter], opts)
      let timeout = setTimeout(() => {
        sub.unsub()
        resolve(null)
      }, this.getTimeout)
      sub.on('event', event => {
        resolve(event)
        clearTimeout(timeout)
        sub.unsub()
      })
    })
  }

  list<K extends number = number>(
      relays: any[],
      filters: Filter<K>[],
      opts?: SubscriptionOptions,
  ): Promise<Event<K>[]> {
    return new Promise(resolve => {
      let events: Event<K>[] = []
      let sub = this.sub(relays, filters, opts)

      sub.on('event', event => {
        events.push(event)
      })

      // we can rely on an eose being emitted here because pool.sub() will fake one
      sub.on('eose', () => {
        sub.unsub()
        resolve(events)
      })
    })
  }

  batchedList<K extends number = number>(
      batchKey: string,
      relays: any[],
      filters: Filter<K>[],
  ): Promise<Event<K>[]> {
    return new Promise(resolve => {
      if (!this.batchedByKey[batchKey]) {
        this.batchedByKey[batchKey] = [
          {
            filters,
            relays,
            resolve,
            events: [],
          },
        ]

        setTimeout(() => {
          Object.keys(this.batchedByKey).forEach(async batchKey => {
            const batchedRequests = this.batchedByKey[batchKey]

            const filters = [] as Filter[]
            const relays = [] as any[]
            batchedRequests.forEach(br => {
              filters.push(...br.filters)
              relays.push(...br.relays)
            })

            const sub = this.sub(relays, filters)
            sub.on('event', event => {
              batchedRequests.forEach(br => matchFilters(br.filters, event) && br.events.push(event))
            })
            sub.on('eose', () => {
              sub.unsub()
              batchedRequests.forEach(br => br.resolve(br.events))
            })

            delete this.batchedByKey[batchKey]
          })
        }, this.batchInterval)
      } else {
        this.batchedByKey[batchKey].push({
          filters,
          relays,
          resolve,
          events: [],
        })
      }
    })
  }

  publish(relays: any[], event: Event<number>): Promise<void>[] {
    return relays.map(async ({gateway_url, canister_actor, canister_id, ic_url, local, persist_key}) => {
      let r = await this.ensureRelay(gateway_url, canister_actor, canister_id, ic_url, local, persist_key);
      await r.connect();
      return r.publish(event)
    })
  }

  seenOn(id: string): string[] {
    return Array.from(this._seenOn[id]?.values?.() || [])
  }
}
