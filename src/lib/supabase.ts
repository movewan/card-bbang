// Mock Supabase client using localStorage
// This allows running the app without a real Supabase instance

/* eslint-disable @typescript-eslint/no-explicit-any */

type EventCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: any
  old: any
}) => void

type Subscription = {
  table: string
  filter?: string
  callback: EventCallback
}

class MockEventEmitter {
  private subscriptions: Map<string, Subscription[]> = new Map()

  subscribe(channelId: string, subscription: Subscription) {
    const subs = this.subscriptions.get(channelId) || []
    subs.push(subscription)
    this.subscriptions.set(channelId, subs)
  }

  unsubscribe(channelId: string) {
    this.subscriptions.delete(channelId)
  }

  emit(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newData: any, oldData: any = {}) {
    this.subscriptions.forEach((subs) => {
      subs.forEach((sub) => {
        if (sub.table === table) {
          if (sub.filter) {
            // Parse filter format: "field=eq.value"
            const match = sub.filter.match(/^(\w+)=eq\.(.+)$/)
            if (match) {
              const [, field, value] = match
              const newMatch = newData[field] === value
              const oldMatch = oldData[field] === value
              if (!newMatch && !oldMatch) {
                return
              }
            }
          }
          sub.callback({ eventType, new: newData, old: oldData })
        }
      })
    })
  }
}

const eventEmitter = new MockEventEmitter()

function getStorageKey(table: string): string {
  return `mock_db_${table}`
}

function getTable<T>(table: string): T[] {
  const data = localStorage.getItem(getStorageKey(table))
  return data ? JSON.parse(data) : []
}

function setTable<T>(table: string, data: T[]): void {
  localStorage.setItem(getStorageKey(table), JSON.stringify(data))
}

function generateId(): string {
  return crypto.randomUUID()
}

function getNow(): string {
  return new Date().toISOString()
}

class MockQueryBuilder {
  private tableName: string
  private filters: Array<{ field: string; value: unknown }> = []
  private orderField?: string
  private orderAsc = true
  private limitCount?: number
  private selectCountOnly = false
  private insertData?: any
  private updateData?: any
  private deleteMode = false

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(_columns?: string, options?: { count?: 'exact'; head?: boolean }): this {
    if (options?.count === 'exact') {
      this.selectCountOnly = true
    }
    return this
  }

  insert(data: any): this {
    this.insertData = data
    return this
  }

  update(data: any): this {
    this.updateData = data
    return this
  }

  delete(): this {
    this.deleteMode = true
    return this
  }

  eq(field: string, value: unknown): this {
    this.filters.push({ field, value })
    return this
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.orderField = field
    this.orderAsc = options?.ascending ?? true
    return this
  }

  limit(count: number): this {
    this.limitCount = count
    return this
  }

  single(): Promise<{ data: any | null; error: Error | null }> {
    return this.execute().then((result) => {
      if (Array.isArray(result.data)) {
        return {
          data: result.data[0] || null,
          error: result.data[0] ? null : new Error('No rows found'),
        }
      }
      return result
    })
  }

  async execute(): Promise<{ data: any; error: Error | null; count?: number }> {
    try {
      const table = getTable<any>(this.tableName)

      // INSERT
      if (this.insertData) {
        const now = getNow()
        const newRecord: any = {
          ...this.insertData,
          id: generateId(),
          created_at: now,
          updated_at: now,
          joined_at: now,
          drawn_at: now,
        }

        // Set defaults based on table
        if (this.tableName === 'game_rooms') {
          newRecord.status = newRecord.status || 'waiting'
          newRecord.host_player_id = newRecord.host_player_id || null
        }
        if (this.tableName === 'players') {
          newRecord.is_ready = newRecord.is_ready ?? false
        }
        if (this.tableName === 'game_rounds') {
          newRecord.round_number = newRecord.round_number ?? 1
          newRecord.next_card_index = newRecord.next_card_index ?? 0
        }

        table.push(newRecord)
        setTable(this.tableName, table)
        eventEmitter.emit(this.tableName, 'INSERT', newRecord)

        return { data: newRecord, error: null }
      }

      // UPDATE
      if (this.updateData) {
        let updatedRecord: any = null
        const updatedTable = table.map((record: any) => {
          const matches = this.filters.every((f) => record[f.field] === f.value)
          if (matches) {
            updatedRecord = { ...record, ...this.updateData, updated_at: getNow() }
            return updatedRecord
          }
          return record
        })
        setTable(this.tableName, updatedTable)
        if (updatedRecord) {
          eventEmitter.emit(this.tableName, 'UPDATE', updatedRecord)
        }
        return { data: updatedRecord, error: null }
      }

      // DELETE
      if (this.deleteMode) {
        let deletedRecord: any = null
        const filteredTable = table.filter((record: any) => {
          const matches = this.filters.every((f) => record[f.field] === f.value)
          if (matches) {
            deletedRecord = record
            return false
          }
          return true
        })
        setTable(this.tableName, filteredTable)
        if (deletedRecord) {
          eventEmitter.emit(this.tableName, 'DELETE', {}, deletedRecord)
        }
        return { data: null, error: null }
      }

      // SELECT
      let result = table.filter((record: any) =>
        this.filters.every((f) => record[f.field] === f.value)
      )

      if (this.orderField) {
        const orderField = this.orderField
        const orderAsc = this.orderAsc
        result.sort((a: any, b: any) => {
          const aVal = a[orderField]
          const bVal = b[orderField]
          if (aVal < bVal) return orderAsc ? -1 : 1
          if (aVal > bVal) return orderAsc ? 1 : -1
          return 0
        })
      }

      if (this.limitCount) {
        result = result.slice(0, this.limitCount)
      }

      if (this.selectCountOnly) {
        return { data: null, error: null, count: result.length }
      }

      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  then<TResult>(
    onfulfilled: (value: { data: any; error: Error | null; count?: number }) => TResult
  ): Promise<TResult> {
    return this.execute().then(onfulfilled)
  }
}

class MockChannel {
  private channelId: string

  constructor(channelId: string) {
    this.channelId = channelId
  }

  on(
    _event: 'postgres_changes',
    config: {
      event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
      schema: string
      table: string
      filter?: string
    },
    callback: EventCallback
  ): this {
    eventEmitter.subscribe(this.channelId, {
      table: config.table,
      filter: config.filter,
      callback,
    })
    return this
  }

  subscribe(): this {
    return this
  }
}

class MockSupabaseClient {
  from(table: string): MockQueryBuilder {
    return new MockQueryBuilder(table)
  }

  channel(channelId: string): MockChannel {
    return new MockChannel(channelId)
  }

  removeChannel(_channel: MockChannel): void {
    // No-op for mock
  }
}

export const supabase = new MockSupabaseClient()
