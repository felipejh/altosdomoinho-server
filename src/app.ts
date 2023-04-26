import Fastify from 'fastify'
import cors from '@fastify/cors'
import { residentsRoutes } from './routes/residents'
import { usersRoutes } from './routes/users'
import { sessionsRoutes } from './routes/sessions'

export const app = Fastify()

app.register(cors, {
  origin: true,
})

app.register(sessionsRoutes, {
  prefix: 'auth',
})

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(residentsRoutes, {
  prefix: 'residents',
})
