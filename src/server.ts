import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './env'
import { residentsRoutes } from './routes/residents'

const app = Fastify()

app.register(cors, {
  origin: true,
})

app.register(residentsRoutes, {
  prefix: 'residents',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log('HTTP Server Running!'))
