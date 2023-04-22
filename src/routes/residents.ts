import crypto from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

interface RequestFiler {
  field: string
  value: string
}

type RequestRange = Array<number>

interface RequestSort {
  column: string
  order: 'ASC' | 'DESC'
}

export async function residentsRoutes(app: FastifyInstance) {
  app.get('/', async (request, response) => {
    const getListParams = z.object({
      filter: z.string().transform((filter) => {
        const parsedFilter = JSON.parse(filter)
        return {
          field: Object.keys(parsedFilter)[0],
          value: Object.values(parsedFilter)[0],
        } as RequestFiler
      }),
      range: z.string().transform((range) => JSON.parse(range) as RequestRange),
      sort: z.string().transform((sort) => {
        const parsedSort = JSON.parse(sort)
        return {
          column: parsedSort[0],
          order: parsedSort[1],
        } as RequestSort
      }),
    })

    const { filter, range, sort } = getListParams.parse(request.query)

    const residents = await knex('residents')
      .limit(range[1] - range[0] + 1)
      .offset(range[0])
      .where((builder) => {
        if (filter.field) {
          const value = String(filter.value).toLocaleLowerCase()

          builder.where(filter.field, 'like', `%${value}%`)
        }
      })
      .orderBy([sort])
      .select('*')

    const [count] = await knex('residents').count()
    const total = Object.values(count)[0]
    const contentRange = `residents ${range[0]}-${range[1]}/${total}`

    return response
      .headers({
        'Access-Control-Expose-Headers': 'Content-range',
        'Content-range': contentRange,
      })
      .send(residents)
  })
  app.get('/:id', async (request, response) => {
    const getResidentParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getResidentParamsSchema.parse(request.params)

    const resident = await knex('residents').where('id', id).first()

    return response.status(200).send(resident)
  })
  app.post('/', async (request, response) => {
    const createResidentBodySchema = z.object({
      name: z.string(),
      apt: z.number(),
      tower: z.string(),
      obs: z.string().optional(),
    })

    const { name, apt, tower, obs } = createResidentBodySchema.parse(
      request.body,
    )

    const [resident] = await knex('residents')
      .insert({
        id: crypto.randomUUID(),
        name,
        apt,
        tower,
        obs,
      })
      .returning('*')

    return response.status(201).send(resident)
  })
  app.delete('/:id', async (request, response) => {
    const deleteResidentQuerySchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteResidentQuerySchema.parse(request.params)

    await knex('residents').where('id', id).del()

    return response.send(id)
  })
  app.put('/:id', async (request, response) => {
    const editResidentQuerySchema = z.object({
      id: z.string().uuid(),
    })

    const editResidentBodySchema = z.object({
      name: z.string().optional(),
      apt: z.number().optional(),
      tower: z.string().optional(),
      obs: z.string().optional(),
    })

    const { id } = editResidentQuerySchema.parse(request.params)
    const { name, apt, tower, obs } = editResidentBodySchema.parse(request.body)

    const query = knex('residents')
      .where('id', id)
      .update('updated_at', knex.fn.now())

    if (name) {
      query.update('name', name)
    }

    if (apt) {
      query.update('apt', apt)
    }

    if (tower) {
      query.update('tower', tower)
    }

    if (obs) {
      query.update('obs', obs)
    }

    const [updatedResident] = await query.returning('*')

    return response.status(200).send(updatedResident)
  })
}
