import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import BottomNav from '../components/BottomNav'

const TABS = ['Expenses', 'Balances', 'Settle Up']

function MemberAvatar({ name, size = 32, index = 0 }) {
  const colors = ['#1D9E75','#D85A30','#6366F1','#F59E0B','#EC4899','#14B8A6','#8B5CF6','#3B82F6']

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: colors[index % colors.length],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 700,
      color: '#fff',
      flexShrink: 0,
      boxShadow:'0 4px 10px rgba(0,0,0,0.2)'
    }}>
      {name?.[0]?.toUpperCase()}
    </div>
  )
}

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { groups, settleDebt, calcBalances } = useGroup()

  const group = groups.find(g => g.id === Number(id))
  const [tab, setTab] = useState(0)

  const balances = useMemo(() => {
    return group ? calcBalances(group) : []
  }, [group, calcBalances])

  if (!group) {
    return (
      <div className="page-shell" style={{
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'column',
        gap:12
      }}>
        <div style={{ fontSize: 50 }}>😕</div>
        <div style={{ color:'var(--ink2)', fontWeight:500 }}>Group not found</div>

        <button
          onClick={() => navigate('/groups')}
          style={{
            background:'linear-gradient(135deg,#14B8A6,#0EA5E9)',
            color:'#fff',
            border:'none',
            padding:'10px 20px',
            borderRadius:12,
            boxShadow:'0 5px 15px rgba(0,0,0,0.2)'
          }}
        >
          Back
        </button>
      </div>
    )
  }

  const expenses = (group.expenses || []).filter(e => !e.isSettlement)

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  const youPaid = expenses
    .filter(e => e.paidBy === 'You')
    .reduce((s, e) => s + (e.amount || 0), 0)

  const youOwe = balances
    .filter(b => b.from === 'You')
    .reduce((s, b) => s + (b.amount || 0), 0)

  function handleSettle(from, to, amount) {
    settleDebt(group.id, from, to, amount)
  }

  return (
    <div className="page-shell" style={{
      background:'linear-gradient(to right,#eef2ff,#f8fafc)',
      minHeight:'100vh',
      display:'flex',
      flexDirection:'column'
    }}>

      <div style={{
        width:'100%',
        maxWidth:480,
        margin:'0 auto',
        flex:1,
        display:'flex',
        flexDirection:'column'
      }}>

        <div style={{
          background:'linear-gradient(135deg,#6366F1,#14B8A6)',
          padding:'18px',
          borderBottomLeftRadius:20,
          borderBottomRightRadius:20,
          color:'#fff',
          boxShadow:'0 10px 30px rgba(0,0,0,0.2)'
        }}>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate('/groups')} style={{
              background:'rgba(255,255,255,0.2)',
              border:'none',
              color:'#fff',
              borderRadius:8,
              padding:'4px 8px'
            }}>
              ←
            </button>

            <div style={{
              width:44,
              height:44,
              borderRadius:12,
              background:'rgba(255,255,255,0.2)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center'
            }}>
              {group.emoji}
            </div>

            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{group.name}</div>
              <div style={{ fontSize:12, opacity:0.9 }}>
                {group.members.join(', ')}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            {[ 
              { label:'Total', value:totalSpent },
              { label:'You paid', value:youPaid },
              { label:'You owe', value:youOwe }
            ].map(s => (
              <div key={s.label} style={{
                flex:1,
                padding:12,
                borderRadius:14,
                background:'rgba(255,255,255,0.2)',
                backdropFilter:'blur(10px)',
                textAlign:'center'
              }}>
                <div style={{ fontSize:12 }}>{s.label}</div>
                <div style={{ fontWeight:700, fontSize:16 }}>
                  ₹{s.value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display:'flex',
            marginTop:16,
            background:'rgba(255,255,255,0.15)',
            borderRadius:10,
            padding:4
          }}>
            {TABS.map((t,i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                style={{
                  flex:1,
                  padding:8,
                  border:'none',
                  borderRadius:8,
                  background: tab===i ? '#fff' : 'transparent',
                  color: tab===i ? '#111' : '#fff',
                  fontWeight:600
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === 0 && (
          <div style={{
            flex:1,
            display:'flex',
            flexDirection:'column',
            justifyContent: expenses.length === 0 ? 'center' : 'flex-start',
            alignItems:'center',
            padding:16
          }}>
            {expenses.length === 0 ? (
              <div style={{
                textAlign:'center',
                color:'#64748B',
                fontWeight:600
              }}>
                <div style={{ fontSize:50 }}>🧾</div>
                <div style={{ marginTop:8 }}>No expenses yet</div>
              </div>
            ) : (
              <div style={{ width:'100%' }}>
                {expenses.map(exp => {
                  const splitCount = exp.splitAmong?.length || 1
                  const perShare = exp.amount / splitCount

                  return (
                    <div key={exp.id} style={{
                      background:'#fff',
                      padding:14,
                      borderRadius:14,
                      marginBottom:12,
                      boxShadow:'0 8px 20px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontWeight:700 }}>{exp.desc}</div>
                          <div style={{ fontSize:12, color:'gray' }}>
                            Paid by {exp.paidBy}
                          </div>
                        </div>

                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:600 }}>
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize:11, color:'gray' }}>
                            ₹{perShare.toFixed(0)} / person
                          </div>
                        </div>
                      </div>

                      <div style={{
                        marginTop:8,
                        fontSize:12,
                        color:'#555'
                      }}>
                        Split among: {exp.splitAmong?.join(', ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div style={{ padding:16 }}>
            {balances.length === 0 ? (
              <div style={{ textAlign:'center', marginTop:40 }}>
                All settled
              </div>
            ) : (
              balances.map((b,i) => (
                <div key={i} style={{
                  padding:14,
                  background:'#fff',
                  borderRadius:14,
                  marginBottom:12,
                  boxShadow:'0 8px 20px rgba(0,0,0,0.08)'
                }}>
                  <strong style={{ color:'#EF4444' }}>{b.from}</strong>
                  {' '}owes{' '}
                  <strong style={{ color:'#10B981' }}>{b.to}</strong>

                  <div style={{ marginTop:6, fontWeight:600 }}>
                    ₹{b.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 2 && (
          <div style={{ padding:16 }}>
            {balances.length === 0 ? (
              'All settled'
            ) : (
              balances.map((b,i) => (
                <button
                  key={i}
                  onClick={() => handleSettle(b.from, b.to, b.amount)}
                  style={{
                    width:'100%',
                    padding:14,
                    marginBottom:12,
                    border:'none',
                    borderRadius:14,
                    background:'linear-gradient(135deg,#10B981,#14B8A6)',
                    color:'#fff',
                    fontWeight:600,
                    boxShadow:'0 6px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  Settle {b.from} → {b.to} (₹{b.amount})
                </button>
              ))
            )}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}