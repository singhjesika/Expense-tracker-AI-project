import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts'
import { useTx } from '../context/TxContext'
import BottomNav from '../components/BottomNav'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DONUT_COLORS = ['#1D9E75','#D85A30','#5DCAA5','#F59E0B','#6366F1','#EC4899','#14B8A6','#8B5CF6']

const HEAT_COLORS = ['#0F172A','#1E293B','#334155','#1D9E75','#22C55E','#16A34A']

function fmtY(n) {
  return n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`
}

export default function AnalyticsPage() {
  const { transactions, categoryTotals } = useTx()
  const navigate = useNavigate()

  const monthlyData = useMemo(() => {
    const map = {}

    transactions.forEach(tx => {
      const d = new Date(tx.date)
      const key = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`

      if (!map[key]) {
        map[key] = { month: key, income: 0, expense: 0, _ts: d.getTime() }
      }

      if (tx.type === 'income') map[key].income += tx.amount
      else map[key].expense += tx.amount
    })

    return Object.values(map)
      .sort((a, b) => a._ts - b._ts)
      .map(m => ({
        ...m,
        savings: Math.max(0, m.income - m.expense),
      }))
  }, [transactions])

  const donutData = useMemo(
    () =>
      categoryTotals
        .filter(([, a]) => a > 0)
        .slice(0, 8)
        .map(([cat, amt]) => ({ name: cat, value: amt })),
    [categoryTotals]
  )

  const simpleWaterfall = useMemo(() => {
    return monthlyData.map(m => ({
      name: m.month,
      Net: m.income - m.expense,
    }))
  }, [monthlyData])

  const cardStyle = {
    background: 'var(--surface)',
    borderRadius: 16,
    padding: '14px',
    border: '1px solid var(--border)',
    color: 'var(--ink1)',
    minWidth: 260
  }

  return (
    <div className="page-shell" style={{ background: 'var(--bg)' }}>

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 12,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          color: 'var(--ink1)'
        }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink1)',
              fontSize: 18,
              cursor: 'pointer'
            }}
          >
            ←
          </button>

          <div>
            <div style={{ fontWeight: 700 }}>Analytics</div>
            <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
              Your spending insights
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 12,
        display: 'flex',
        gap: 16,
        overflowX: 'auto'
      }}>

        <div style={cardStyle}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>📈 Monthly Trends</div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke="var(--ink3)" />
              <YAxis tickFormatter={fmtY} stroke="var(--ink3)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink1)'
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#1D9E75" />
              <Bar dataKey="expense" fill="#D85A30" />
              <Bar dataKey="savings" fill="#5DCAA5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>🍩 Category</div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} dataKey="value" outerRadius={80}>
                {donutData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>🔥 Heatmap</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7,1fr)',
            gap: 3
          }}>
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  background: HEAT_COLORS[i % HEAT_COLORS.length],
                  borderRadius: 2
                }}
              />
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>💧 Net Flow</div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={simpleWaterfall}>
              <XAxis dataKey="name" stroke="var(--ink3)" />
              <YAxis tickFormatter={fmtY} stroke="var(--ink3)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink1)'
                }}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Bar dataKey="Net">
                {simpleWaterfall.map((e, i) => (
                  <Cell key={i} fill={e.Net >= 0 ? '#1D9E75' : '#D85A30'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
