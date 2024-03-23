import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as compression from 'compression'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )
  app.use(compression())
  app.enableCors()
  await app.listen(3000)

  process.on('SIGINT', function () {
    app.close().then(() => {
      process.exit(0)
    })
  })
}
bootstrap().then()
