import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('residents', (table) => {
    table.text('vehicle_model')
    table.text('vehicle_license_plate')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('residents', (table) => {
    table.dropColumns('vehicle_model', 'vehicle_license_plate')
  })
}
