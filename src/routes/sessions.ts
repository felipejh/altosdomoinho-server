import { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { knex } from '../database'
import jwt from 'jsonwebtoken'
import authConfig from '../config/auth'

export async function sessionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createSessionBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = createSessionBodySchema.parse(request.body)

    const [user] = await knex('users').select('*').where('email', email)

    if (!user) {
      return response.status(403).send('E-mail/password does not match')
    }
    const passwordHash = await bcrypt.compare(password, user.password_hash)

    if (!passwordHash) {
      return response.status(403).send('E-mail/password does not match')
    }

    const token = jwt.sign({ userId: user.id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    })

    return response.status(200).send({
      user,
      token,
    })
  })
}
