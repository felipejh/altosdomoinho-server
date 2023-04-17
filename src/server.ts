import fastify from 'fastify'
import { env } from './env'
import { residentsRoutes } from './routes/residents'

const app = fastify()

app.register(residentsRoutes, {
  prefix: 'residents',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log('HTTP Server Running!'))
