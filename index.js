const fetch = require('node-fetch')
const startTime = Date.now()
let errors = 0
let numFinished = 0
let numPending = 0

const { RateLimiter } = require('limiter')

const myFunction = async (item, index, totalItems) => {
  const start = Date.now()

  numPending++
  console.log(`request: ${index}, start time: ${Date.now() - startTime}, numPending: ${numPending}`)

  const result = await fetch(
    `https://min-api.cryptocompare.com/data/histoday?fsym=${item}&tsym=USD&limit=1000`
  )
    .then((j) => j.json())
    .then((res) => {
      numPending--
      if (Object.keys(res.RateLimit).length) {
        errors++
        console.error(
          `request: ${index}. failed after: ${Date.now() - start}. finish time - ${Date.now() -
            startTime}`
        )

        throw new Error('boo!')
      } else {
        numFinished++
        console.log(
          `request: ${index}. finished after: ${Date.now() - start}. finish time - ${Date.now() -
            startTime}, numFinished: ${numFinished}`
        )
      }

      if (numFinished === totalItems) {
        console.log('FINISH', Date.now() - startTime)
        console.error('ERRORS', errors)
      }
    })

  return result
}

const data = [
  '42',
  '300',
  '365',
  '404',
  '433',
  '611',
  '808',
  '888',
  '1337',
  '2015',
  'BTC',
  'ETH',
  'LTC',
  'DASH',
  'XMR',
  'NXT',
  'ETC',
  'DOGE',
  'ZEC',
  'BTS',
  'DGB',
  'XRP',
  'BTCD',
  'PPC',
  'CRAIG',
  'XBS',
  'XPY',
  'PRC',
  'YBC',
  'DANK',
  'GIVE',
  'KOBO',
  'DT',
  'CETI',
  'SUP',
  'XPD',
  'GEO',
  'CHASH',
  'SPR',
  'NXTI',
  'WOLF',
  'XDP',
  'AC',
  'ACOIN',
  'AERO',
  'ALF',
  'AGS',
  'AMC',
  'ALN',
  'APEX',
  'ARCH',
  'ARG',
  'ARI',
  'AUR',
  'AXR',
  'BET',
  'BEAN',
  'BLU',
  'BLK',
  'BOST',
  'BQC',
  'XMY',
  'MOON',
  'ZET',
  'SXC',
  'QTL',
  'ENRG',
  'QRK',
  'RIC',
  'DGC',
  'LIMX',
  'BTB',
  'CAIX',
  'BTMK',
  'BUK',
  'CACH',
  'CANN',
  'CAP',
  'CASH',
  'CAT',
  'CBX',
  'CCN',
  'CIN',
  'CINNI',
  'CXC',
  'CLAM',
  'CLOAK',
  'CLR',
  'CMC',
  'CNC',
  'CNL',
  'COMM',
  'COOL',
  'CRACK',
  'CRYPT',
  'CSC',
  'DEM',
  'DMD',
  'XVG',
  'DRKC',
]

const sLimiter = new RateLimiter(8, 'second')
const hLimiter = new RateLimiter(1000, 'hour')

const withLimiter = (limiter) => (fn) => (...args) => limiter.removeTokens(1, () => fn(...args))
const withBackoff = (fn) => async (...args) => {
  let delay = 100
  while (true) {
    try {
      return await fn(...args)
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2
      delay = Math.min(delay, 10000) // never wait more than 10 seconds
    }
  }
}

const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)
const wrap = compose(
  withLimiter(hLimiter),
  withLimiter(sLimiter),
  withBackoff
)

const wrapped = wrap(myFunction)

data.forEach((item, index, arr) => wrapped(item, index, arr.length))
