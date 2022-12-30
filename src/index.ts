import { Hono } from 'hono'
import React from 'react'
import { renderToString } from 'react-dom/server'
import Avatar from 'boring-avatars'

const Variants = {
  marble: 'marble',
  beam: 'beam',
  pixel: 'pixel',
  sunset: 'sunset',
  ring: 'ring',
  bauhaus: 'bauhaus',
} as const

type Variants = typeof Variants[keyof typeof Variants]

const DEFAULT_SIZE = 40
const DEFAULT_VARIANT = Variants.marble
const VALID_VARIANTS = new Set(Object.keys(Variants))

function normalizeColors(colors?: string): string[] | undefined {
  const colorPalette = colors?.split(',') ?? []
  if (colorPalette.length) {
    return colorPalette.map((color) => (color.startsWith('#') ? color : `#${color}`))
  }
  return undefined
}

const app = new Hono()

app.get('/:name', (c) => {
  const name = c.req.param('name')
  const size = c.req.query('size') || DEFAULT_SIZE
  const variant = (c.req.query('variant') || DEFAULT_VARIANT) as Variants
  const colors = normalizeColors(c.req.query('colors'))
  const square = c.req.query('square') !== ''

  if (!VALID_VARIANTS.has(variant)) {
    return new Response('invalid variant', { status: 400, headers: { 'Content-Type': 'text/plain' } })
  }

  const svg = renderToString(
    React.createElement(
      Avatar,
      {
        size,
        name,
        variant,
        colors,
        square,
      },
      null,
    ),
  )

  return new Response(svg, {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'max-age=2592000' },
  })
})

export default app
