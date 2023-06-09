import crypto from 'node:crypto'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import authMiddleware from '../middlewares/auth'

type RequestFiler = Array<{
  field: string
  value: string
}>

type RequestRange = Array<number>

interface RequestSort {
  column: string
  order: 'ASC' | 'DESC'
}

export async function residentsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware)

  app.get('/', async (request, response) => {
    const getListParams = z.object({
      filter: z.string().transform((filter) => {
        const parsedFilter = JSON.parse(filter)
        const filters: RequestFiler = Object.keys(parsedFilter).map(
          (field) => ({
            field,
            value: parsedFilter[field],
          }),
        )

        return filters
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

    const { filter: filters, range, sort } = getListParams.parse(request.query)

    const residents = await knex('residents')
      .limit(range[1] - range[0] + 1)
      .offset(range[0])
      .where((builder) => {
        if (filters.length) {
          filters.forEach((filter) => {
            const value = String(filter.value).toLocaleLowerCase()

            builder.whereRaw(`LOWER(${filter.field}) LIKE ?`, `%${value}%`)
          })
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
      apt: z.string(),
      tower: z.string(),
      obs: z.string().optional(),
      phone_number: z.string().optional(),
      vehicle_model: z.string().optional(),
      vehicle_license_plate: z.string().optional(),
    })

    const {
      name,
      apt,
      tower,
      obs,
      phone_number,
      vehicle_model,
      vehicle_license_plate,
    } = createResidentBodySchema.parse(request.body)

    const [resident] = await knex('residents')
      .insert({
        id: crypto.randomUUID(),
        name,
        apt,
        tower,
        obs,
        phone_number,
        vehicle_model,
        vehicle_license_plate,
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
      apt: z.string().optional(),
      tower: z.string().optional(),
      obs: z.string().optional().nullable(),
      phone_number: z.string().optional().nullable(),
      vehicle_model: z.string().optional().nullable(),
      vehicle_license_plate: z.string().optional().nullable(),
    })

    const { id } = editResidentQuerySchema.parse(request.params)
    const {
      name,
      apt,
      tower,
      obs,
      phone_number,
      vehicle_model,
      vehicle_license_plate,
    } = editResidentBodySchema.parse(request.body)

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

    if (phone_number) {
      query.update('phone_number', phone_number)
    }

    if (vehicle_model) {
      query.update('vehicle_model', vehicle_model)
    }

    if (vehicle_license_plate) {
      query.update('vehicle_license_plate', vehicle_license_plate)
    }

    const [updatedResident] = await query.returning('*')

    return response.status(200).send(updatedResident)
  })
}
