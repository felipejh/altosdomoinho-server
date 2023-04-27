// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password_hash: string
      created_at: string
      updated_at: string
    }
    residents: {
      id: string
      name: string
      apt: number
      tower: string
      obs: string | undefined
      vehicle_model: string | undefined
      vehicle_license_plate: string | undefined
      created_at: string
      updated_at: string
    }
  }
}
