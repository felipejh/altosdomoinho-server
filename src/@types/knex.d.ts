// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    residents: {
      id: string
      name: string
      apt: number
      tower: string
      created_at: string
      updated_at: string
    }
  }
}
