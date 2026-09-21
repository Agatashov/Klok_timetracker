'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Period = 'week' | 'month' | 'all' | 'custom'

interface Props {
  currentPeriod: Period
  currentFrom?: string
  currentTo?: string
}

export function InsightsPeriodSelector({ currentPeriod, currentFrom, currentTo }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')
  const [fromDate, setFromDate] = useState(currentFrom ?? todayStr)
  const [toDate, setToDate] = useState(currentTo ?? todayStr)

  useEffect(() => {
    setShowCustom(currentPeriod === 'custom')
  }, [currentPeriod])

  function navigate(period: Period, from?: string, to?: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    if (from) params.set('from', from)
    else params.delete('from')
    if (to) params.set('to', to)
    else params.delete('to')
    router.push(`/insights?${params.toString()}`)
  }

  function handlePeriodClick(period: 'week' | 'month' | 'all') {
    setShowCustom(false)
    navigate(period)
  }

  function handleCustomToggle() {
    setShowCustom(true)
    if (currentPeriod !== 'custom') {
      // Don't navigate yet — wait for user to fill in dates
    }
  }

  function handleApplyCustom() {
    if (fromDate && toDate) {
      navigate('custom', fromDate, toDate)
    }
  }

  const btnBase = 'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors'
  const btnActive = 'text-white'
  const btnInactive = 'hover:text-[color:var(--foreground)]'

  const periods: { key: 'week' | 'month' | 'all'; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All time' },
  ]

  return (
    <div className="flex flex-col gap-3 items-end">
      {/* Period toggle */}
      <div
        className="flex items-center gap-0.5 rounded-xl border p-1"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {periods.map(({ key, label }) => {
          const active = currentPeriod === key && !showCustom
          return (
            <button
              key={key}
              onClick={() => handlePeriodClick(key)}
              className={`${btnBase} ${active ? btnActive : btnInactive}`}
              style={active ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--muted)' }}
            >
              {label}
            </button>
          )
        })}
        <button
          onClick={handleCustomToggle}
          className={`${btnBase} ${showCustom ? btnActive : btnInactive}`}
          style={showCustom ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--muted)' }}
        >
          Custom
        </button>
      </div>

      {/* Custom date range picker */}
      {showCustom && (
        <div
          className="flex items-center gap-2 rounded-xl border p-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>From</label>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={e => setFromDate(e.target.value)}
              className="text-sm rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                colorScheme: 'light dark',
              }}
            />
          </div>
          <span style={{ color: 'var(--faint)' }}>→</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={todayStr}
              onChange={e => setToDate(e.target.value)}
              className="text-sm rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                colorScheme: 'light dark',
              }}
            />
          </div>
          <button
            onClick={handleApplyCustom}
            disabled={!fromDate || !toDate || fromDate > toDate}
            className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)' }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
