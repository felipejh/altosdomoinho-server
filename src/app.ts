import Fastify from 'fastify'
import cors from '@fastify/cors'
import { residentsRoutes } from './routes/residents'

export const app = Fastify()

app.register(cors, {
  origin: true,
})

app.register(residentsRoutes, {
  prefix: 'residents',
})
