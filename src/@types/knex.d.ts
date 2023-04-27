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
      apt: string
      tower: string
      obs: string | undefined
      phone_number: string | undefined
      vehicle_model: string | undefined
      vehicle_license_plate: string | undefined
      created_at: string
      updated_at: string
    }
  }
}
