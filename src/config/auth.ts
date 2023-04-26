import { env } from '../env'

export default {
  secret: env.APP_SECRET,
  expiresIn: '7d',
}
