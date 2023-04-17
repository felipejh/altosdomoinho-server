import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('residents', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.integer('apt').notNullable()
    table.text('tower').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('residents')
}
