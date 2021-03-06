import bankai = require('bankai/http')
import fp = require('fastify-plugin')
import { FastifyInstance } from 'fastify'
import { EventEmitter } from 'events'

function _fastifyBankaiHook<
  HttpServer,
  HttpRequest,
  HttpResponse extends EventEmitter
>(
  fastify: FastifyInstance<HttpServer, HttpRequest, HttpResponse>,
  o: FastifyBankaiHookOpts,
  next: (err?: Error) => void
): void {
  const { entry, opts = {} } = o

  if (entry == null) {
    throw new Error('entry is not defined')
  }

  if (opts.quiet === undefined) {
    opts.quiet = true
  }

  const handler: any = bankai(entry, opts)
  const { compiler, state } = handler

  fastify.get('/*', (request, reply) => {
    handler(request.raw, reply.res, () => {
      if (state.ssr && state.ssr.success === false) {
        reply
          .code(500)
          .type('text/plain')
          .send('error occured')
        const error = state.ssr.error
        fastify.log.error(
          'Error occured while rendering Bankai app.',
          error instanceof Error ? error.message : error
        )
      } else {
        reply
          .code(404)
          .type('text/plain')
          .send('not found')
      }
    })
  })

  fastify.addHook('onClose', (f, done) => {
    compiler.close()
    setImmediate(done)
  })

  compiler.on('error', (nodeName, edgeName, err) => {
    fastify.log.error(err.message)
  })

  compiler.once('change', () => next(/* err = undefined */))
}

export default function FastifyBankaiHook<
  HttpServer,
  HttpRequest,
  HttpResponse extends EventEmitter
>() {
  const plugin = fp<
    HttpServer,
    HttpRequest,
    HttpResponse,
    FastifyBankaiHookOpts
  >(_fastifyBankaiHook, {
    fastify: '>= 0.40.0'
  })

  _fastifyBankaiHook[Symbol.for('skip-override')] = false

  return plugin
}

export interface BankaiOpts {
  quiet?: boolean
  watch?: boolean
  babelifyDeps?: boolean
}

export interface FastifyBankaiHookOpts {
  entry: string
  opts?: BankaiOpts
  prefix?: string
}
