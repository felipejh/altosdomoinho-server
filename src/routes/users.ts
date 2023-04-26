import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const passwordHash = await bcrypt.hash(password, 8)

    const [user] = await knex('users')
      .insert({
        id: crypto.randomUUID(),
        name,
        email,
        password_hash: passwordHash,
      })
      .returning('*')

    return response.status(201).send(user)
  })
}
