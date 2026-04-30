// -----------------------------
// Retry Algorithms
// -----------------------------

export type RetryAlgorithm =
  | 'fixed'
  | 'linear'
  | 'exponential'
  | 'exponential-jitter'
  | 'equal-jitter'
  | 'decorrelated-jitter'
  | 'fibonacci'
  | 'polynomial'

export interface RetryOptions {
  retries: number
  baseDelay: number
  maxDelay?: number
  algorithm: RetryAlgorithm
  polynomialPower?: number // for polynomial backoff
  jitter?: boolean
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fibonacci(n: number): number {
  if (n <= 1) return 1
  let a = 1,
    b = 1
  for (let i = 2; i <= n; i++) {
    const next = a + b
    a = b
    b = next
  }
  return b
}

// -----------------------------
// Delay Calculation
// -----------------------------

export function calculateDelay(
  attempt: number,
  opts: RetryOptions,
  previousDelay?: number
): number {
  const { baseDelay, maxDelay = Infinity, algorithm } = opts

  let delay: number

  switch (algorithm) {
    case 'fixed':
      delay = baseDelay
      break

    case 'linear':
      delay = baseDelay * attempt
      break

    case 'exponential':
      delay = baseDelay * Math.pow(2, attempt)
      break

    case 'exponential-jitter': {
      const max = baseDelay * Math.pow(2, attempt)
      delay = Math.random() * max
      break
    }

    case 'equal-jitter': {
      const max = baseDelay * Math.pow(2, attempt)
      delay = max / 2 + Math.random() * (max / 2)
      break
    }

    case 'decorrelated-jitter': {
      const prev = previousDelay ?? baseDelay
      delay = Math.min(maxDelay, Math.random() * prev * 3)
      break
    }

    case 'fibonacci':
      delay = fibonacci(attempt) * baseDelay
      break

    case 'polynomial':
      delay = baseDelay * Math.pow(attempt, opts.polynomialPower ?? 2)
      break

    default:
      delay = baseDelay
  }

  return Math.min(delay, maxDelay)
}

// -----------------------------
// Retry Wrapper
// -----------------------------

export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  let lastError: unknown
  let previousDelay = opts.baseDelay

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      if (attempt > 0) {
        console.warn('Retry attempt', { attempt })
      }

      return await fn()
    } catch (err) {
      lastError = err

      if (attempt === opts.retries) {
        console.error('Retry failed after max attempts', { error: err })
        throw err
      }

      const delay = calculateDelay(attempt, opts, previousDelay)
      previousDelay = delay

      console.info('Retrying after delay', { delay, attempt })
      await sleep(delay)
    }
  }

  throw lastError
}

/*
await retry(
  () => axios.get("/api/network/scan"),
  {
    retries: 5,
    baseDelay: 200,
    maxDelay: 5000,
    algorithm: "exponential-jitter",
  }
)

await retry(
  () => fetch("/network/summary"),
  {
    retries: 6,
    baseDelay: 100,
    maxDelay: 3000,
    algorithm: "decorrelated-jitter",
  }
)

await retry(
  () => doSomething(),
  {
    retries: 7,
    baseDelay: 150,
    algorithm: "fibonacci",
  }
)

await retry(
  () => doThing(),
  {
    retries: 4,
    baseDelay: 100,
    algorithm: "polynomial",
    polynomialPower: 2,
  }
)


*/
