import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('residents', (table) => {
    table.string('apt').alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('residents', (table) => {
    table.integer('apt').alter()
  })
}
