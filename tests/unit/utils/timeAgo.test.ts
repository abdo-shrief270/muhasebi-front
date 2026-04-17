import { describe, it, expect, vi, afterEach } from 'vitest'
import { timeAgo } from '~/shared/utils/timeAgo'

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function setNow(date: Date) {
    vi.useFakeTimers()
    vi.setSystemTime(date)
  }

  const base = new Date('2026-04-04T12:00:00Z')

  it('returns "just now" for less than 1 minute ago', () => {
    setNow(new Date(base.getTime() + 30_000)) // 30 seconds later
    expect(timeAgo(base.toISOString())).toBe('just now')
  })

  it('returns minutes ago for < 60 minutes', () => {
    setNow(new Date(base.getTime() + 5 * 60_000)) // 5 min later
    expect(timeAgo(base.toISOString())).toBe('5m ago')
  })

  it('returns hours ago for < 24 hours', () => {
    setNow(new Date(base.getTime() + 3 * 60 * 60_000)) // 3 hours later
    expect(timeAgo(base.toISOString())).toBe('3h ago')
  })

  it('returns days ago for >= 24 hours', () => {
    setNow(new Date(base.getTime() + 2 * 24 * 60 * 60_000)) // 2 days later
    expect(timeAgo(base.toISOString())).toBe('2d ago')
  })

  it('returns Arabic for locale=ar', () => {
    setNow(new Date(base.getTime() + 10 * 60_000))
    expect(timeAgo(base.toISOString(), 'ar')).toBe('منذ 10 دقيقة')
  })

  it('returns Arabic "just now"', () => {
    setNow(new Date(base.getTime() + 20_000))
    expect(timeAgo(base.toISOString(), 'ar')).toBe('الآن')
  })

  it('returns Arabic hours', () => {
    setNow(new Date(base.getTime() + 7 * 60 * 60_000))
    expect(timeAgo(base.toISOString(), 'ar')).toBe('منذ 7 ساعة')
  })

  it('returns Arabic days', () => {
    setNow(new Date(base.getTime() + 5 * 24 * 60 * 60_000))
    expect(timeAgo(base.toISOString(), 'ar')).toBe('منذ 5 يوم')
  })
})
