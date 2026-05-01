// useEpoch.ts

export type EpochType = 'seconds' | 'milliseconds'

export function useEpoch() {
  const formatEpoch = (epoch: number): string => {
    const ms = epoch < 1_000_000_000_000 ? epoch * 1000 : epoch
    const d = new Date(ms)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const pad = (n: number) => n.toString().padStart(2, '0')
    const weekday = weekdays[d.getDay()]
    const month = months[d.getMonth()]
    const year = d.getFullYear().toString().slice(-2)
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `${weekday} ${month} ${year} ${hours}:${minutes}`
  }

  const formatEpochDiff = (a: number, b: number): string => {
    const diffMs = Math.abs(a - b)
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24
    return `${days}d ${hours}h`
  }

  const now = () => {
    return Date.now()
  }

  const seconds = (epoch: number): number => {
    return Math.floor(epoch / 1000)
  }

  const startOfDay = (epoch: number): number => {
    // Normalize: if epoch looks like seconds, convert to ms
    const ms = epoch < 1_000_000_000_000 ? epoch * 1000 : epoch

    const d = new Date(ms)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)

    return start.getTime()
  }

  const endOfDay = (epoch: number): number => {
    // Normalize: if epoch looks like seconds, convert to ms
    const ms = epoch < 1_000_000_000_000 ? epoch * 1000 : epoch

    const d = new Date(ms)
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

    return end.getTime()
  }

  const determineEpochType = (epoch: number): EpochType => {
    return epoch < 1_000_000_000_000 ? 'seconds' : 'milliseconds'
  }

  const normalizeEpochMs = (epoch: number): number => {
    return determineEpochType(epoch) === 'seconds' ? epoch * 1000 : epoch
  }

  return {
    formatEpoch,
    formatEpochDiff,
    now,
    seconds,
    startOfDay,
    endOfDay,
    determineEpochType,
    normalizeEpochMs,
  }
}
