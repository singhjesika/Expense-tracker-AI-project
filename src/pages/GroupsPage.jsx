import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../context/GroupContext'
import BottomNav from '../components/BottomNav'

const GROUP_EMOJIS = ['🏖️','🏕️','🍕','✈️','🏠','🎉','🛒','🚗','💼','🎓','🏋️','🎮']

export default function GroupsPage() {
  const navigate = useNavigate()
  const { groups, createGroup, calcBalances } = useGroup()

  const [showCreate,  setShowCreate]  = useState(false)
  const [groupName,   setGroupName]   = useState('')
  const [emoji,       setEmoji]       = useState('🏖️')
  const [memberInput, setMemberInput] = useState('')
  const [members,     setMembers]     = useState(['You'])

  function addMember() {
    const name = memberInput.trim()
    if (!name || members.includes(name) || members.length >= 8) return
    setMembers(prev => [...prev, name])
    setMemberInput('')
  }

  function removeMember(name) {
    if (name === 'You') return
    setMembers(prev => prev.filter(m => m !== name))
  }

  function handleCreate() {
    if (!groupName.trim() || members.length < 2) return
    const id = createGroup(groupName.trim(), emoji, members)
    setShowCreate(false)
    setGroupName('')
    setEmoji('🏖️')
    setMembers(['You'])
    setMemberInput('')
    navigate(`/groups/${id}`)
  }

  function handleCancel() {
    setShowCreate(false)
    setGroupName('')
    setEmoji('🏖️')
    setMembers(['You'])
    setMemberInput('')
  }

  const { totalOwe, totalOwed } = groups.reduce(
    (acc, g) => {
      const balances = calcBalances(g)
      balances.forEach(b => {
        if (b.from === 'You') acc.totalOwe  += b.amount
        if (b.to   === 'You') acc.totalOwed += b.amount
      })
      return acc
    },
    { totalOwe: 0, totalOwed: 0 }
  )

  return (
    <>
      <div className="page-shell" style={{ background: 'var(--bg,#f5f5f5)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 80px' }}>

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 20px 16px',
            background: 'var(--surface,#fff)',
            borderBottom: '1px solid var(--border,#e5e7eb)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => navigate('/home')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ink2,#555)', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div>
                {/* ✅ Dark mode fix */}
                <div className="header-title">Split Expenses</div>
                <div style={{ fontSize: 12, color: 'var(--ink3,#999)' }}>
                  Groups & shared bills
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: '#1D9E75', border: 'none', cursor: 'pointer',
                color: '#fff', borderRadius: 10, padding: '7px 14px',
                fontSize: 13, fontWeight: 600,
              }}
            >+ Group</button>
          </div>

          {/* ── Summary bar ── */}
          {groups.length > 0 && (
            <div style={{ margin: '12px 16px 0', display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: '#fef0eb', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#D85A30', marginBottom: 2 }}>You owe</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#D85A30' }}>
                  ₹{totalOwe.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ flex: 1, background: '#e8f5f0', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#1D9E75', marginBottom: 2 }}>You are owed</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1D9E75' }}>
                  ₹{totalOwed.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {groups.length === 0 && !showCreate && (
            <div style={{ margin: '60px 16px 0', textAlign: 'center', color: 'var(--ink3,#999)' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink2,#555)', marginBottom: 6 }}>
                No groups yet
              </div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>
                Create a group for trips, flatmates or shared expenses
              </div>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  background: '#1D9E75', color: '#fff', border: 'none',
                  borderRadius: 12, padding: '12px 28px', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >+ Create your first group</button>
            </div>
          )}

          {/* ── Groups list ── */}
          {groups.map(g => {
            const balances   = calcBalances(g)
            const youOwe     = balances.filter(b => b.from === 'You').reduce((s, b) => s + b.amount, 0)
            const youAreOwed = balances.filter(b => b.to   === 'You').reduce((s, b) => s + b.amount, 0)
            const totalExp   = g.expenses.filter(e => !e.isSettlement).reduce((s, e) => s + e.amount, 0)

            return (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                style={{
                  margin: '10px 16px 0', background: 'var(--surface,#fff)',
                  borderRadius: 16, padding: '14px 16px',
                  border: '1px solid var(--border,#e5e7eb)', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: '#e8f5f0', fontSize: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{g.emoji}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink1,#111)' }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink3,#999)', marginTop: 2 }}>
                      {g.members.length} members · {g.expenses.filter(e => !e.isSettlement).length} expenses · ₹{totalExp.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {youOwe > 0 && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#D85A30', background: '#fef0eb', borderRadius: 8, padding: '3px 8px' }}>
                        −₹{youOwe.toLocaleString('en-IN')}
                      </div>
                    )}
                    {youAreOwed > 0 && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1D9E75', background: '#e8f5f0', borderRadius: 8, padding: '3px 8px', marginTop: youOwe > 0 ? 4 : 0 }}>
                        +₹{youAreOwed.toLocaleString('en-IN')}
                      </div>
                    )}
                    {youOwe === 0 && youAreOwed === 0 && (
                      <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>✓ Settled</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', marginTop: 10, alignItems: 'center' }}>
                  {g.members.slice(0, 5).map((m, i) => (
                    <div key={m} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: ['#1D9E75','#D85A30','#6366F1','#F59E0B','#EC4899'][i % 5],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      border: '2px solid var(--surface,#fff)',
                      marginLeft: i > 0 ? -8 : 0,
                    }}>{m[0].toUpperCase()}</div>
                  ))}
                  {g.members.length > 5 && (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: '#e5e7eb',
                      fontSize: 10, fontWeight: 700, color: '#666',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: -8, border: '2px solid var(--surface,#fff)',
                    }}>+{g.members.length - 5}</div>
                  )}
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 11, color: 'var(--ink3,#999)' }}>{g.createdAt}</div>
                </div>
              </div>
            )
          })}

        </div>
        <BottomNav />
      </div>

      {/* ✅ MODAL — completely outside page-shell, no event interference */}
      {showCreate && (
        <div
          className="group-form-modal"
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleCancel() }}
        >
          <div className="group-form-inner">

            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              🆕 New Group
            </div>

            {/* Emoji picker */}
            <div style={{ fontSize: 12, color: 'var(--ink3,#999)', marginBottom: 6 }}>
              Pick an icon
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {GROUP_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 38, height: 38, fontSize: 20,
                    border: emoji === e ? '2px solid #1D9E75' : '1.5px solid var(--border,#e5e7eb)',
                    borderRadius: 10,
                    background: emoji === e ? '#e8f5f0' : 'var(--bg,#f5f5f5)',
                  }}
                >{e}</button>
              ))}
            </div>

            {/* Group name */}
            <div style={{ fontSize: 12, color: 'var(--ink3,#999)', marginBottom: 6 }}>
              Group name
            </div>
            <input
              type="text"
              autoFocus
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Goa Trip, Flat expenses"
            />

            {/* Members */}
            <div style={{ fontSize: 12, color: 'var(--ink3,#999)', marginBottom: 8 }}>
              Members ({members.length}/8) — add at least 1 friend
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {members.map(m => (
                <div key={m} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: m === 'You' ? '#e8f5f0' : 'var(--bg,#f5f5f5)',
                  border: `1.5px solid ${m === 'You' ? '#1D9E75' : 'var(--border,#e5e7eb)'}`,
                  borderRadius: 20, padding: '5px 10px', fontSize: 13,
                }}>
                  <span style={{
                    color: m === 'You' ? '#1D9E75' : 'var(--ink1,#111)',
                    fontWeight: m === 'You' ? 700 : 400,
                  }}>
                    {m === 'You' ? '👤 You' : m}
                  </span>
                  {m !== 'You' && (
                    <button
                      type="button"
                      onClick={() => removeMember(m)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#999', fontSize: 14, padding: 0, lineHeight: 1,
                      }}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>

            {members.length < 8 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  value={memberInput}
                  onChange={e => setMemberInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
                  placeholder="Friend's name e.g. Riya"
                  style={{ marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={addMember}
                  style={{
                    background: '#e8f5f0', border: '1.5px solid #1D9E75',
                    color: '#1D9E75', borderRadius: 10, padding: '9px 14px',
                    fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >+ Add</button>
              </div>
            )}

            {members.length < 2 && (
              <div style={{
                fontSize: 12, color: '#F59E0B', marginBottom: 10,
                padding: '6px 10px', background: '#FAEEDA', borderRadius: 8,
              }}>
                ⚠️ Add at least 1 friend to create a group
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12,
                  border: '1px solid var(--border,#e5e7eb)',
                  background: 'var(--surface,#fff)',
                  fontSize: 13, fontWeight: 600, color: 'var(--ink2,#555)',
                }}
              >Cancel</button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!groupName.trim() || members.length < 2}
                style={{
                  flex: 2, padding: '11px', borderRadius: 12, border: 'none',
                  background: groupName.trim() && members.length >= 2 ? '#1D9E75' : '#ccc',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  cursor: groupName.trim() && members.length >= 2 ? 'pointer' : 'not-allowed',
                }}
              >
                {members.length < 2
                  ? 'Add a friend first'
                  : `Create "${groupName || 'Group'}" →`}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}