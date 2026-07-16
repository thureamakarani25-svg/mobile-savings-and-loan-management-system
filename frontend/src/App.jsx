import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = '/api'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

const emptyMember = {
  full_name: '',
  gender: 'Female',
  phone: '',
  email: '',
  address: '',
  national_id: '',
}

const emptySaving = {
  memberId: '',
  amount: '',
}

const emptyLoan = {
  memberId: '',
  amount: '',
  interest_rate: '',
  duration: '',
  status: 'Pending',
}

const emptyRepayment = {
  loanId: '',
  amount_paid: '',
}

function money(value) {
  return `TZS ${Number(value || 0).toLocaleString()}`
}

function normalizeSaving(item) {
  return { ...item, memberId: item.member }
}

function normalizeLoan(item) {
  return { ...item, memberId: item.member }
}

function normalizeRepayment(item) {
  return { ...item, loanId: item.loan }
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(Object.values(data).flat().join(' ') || 'Request failed')
  }

  return response.json()
}

function App() {
  const [side, setSide] = useState('admin')
  const [page, setPage] = useState('dashboard')
  const [members, setMembers] = useState([])
  const [savings, setSavings] = useState([])
  const [loans, setLoans] = useState([])
  const [repayments, setRepayments] = useState([])
  const [memberForm, setMemberForm] = useState(emptyMember)
  const [savingForm, setSavingForm] = useState(emptySaving)
  const [loanForm, setLoanForm] = useState(emptyLoan)
  const [repaymentForm, setRepaymentForm] = useState(emptyRepayment)
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [authUser, setAuthUser] = useState(getStoredUser())
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)

  async function loadData() {
    try {
      setLoading(true)
      const [memberData, savingData, loanData, repaymentData] = await Promise.all([
        request('/members/'),
        request('/savings/'),
        request('/loans/'),
        request('/repayments/'),
      ])

      setMembers(memberData)
      setSavings(savingData.map(normalizeSaving))
      setLoans(loanData.map(normalizeLoan))
      setRepayments(repaymentData.map(normalizeRepayment))
      setMessage('')
    } catch (error) {
      setMessage(`Could not load data. Make sure Django server is running. ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authUser) {
      setLoading(false)
      return
    }

    loadData()
  }, [authUser])

  async function handleLogin(event) {
    event.preventDefault()
    setAuthLoading(true)
    try {
      const user = await request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      localStorage.setItem('authUser', JSON.stringify(user))
      setAuthUser(user)
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await request('/auth/logout/', { method: 'POST' })
    } catch (error) {
      setMessage(error.message)
    } finally {
      localStorage.removeItem('authUser')
      setAuthUser(null)
      setMessage('Logged out successfully.')
    }
  }

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await request('/auth/me/')
        if (user?.username) {
          localStorage.setItem('authUser', JSON.stringify(user))
          setAuthUser(user)
        }
      } catch {
        localStorage.removeItem('authUser')
        setAuthUser(null)
      }
    }

    if (getStoredUser()) {
      loadCurrentUser()
    }
  }, [])

  useEffect(() => {
    if (authUser && authUser.is_admin) {
      setSide('admin')
    } else if (authUser) {
      setSide('mobile')
    }
  }, [authUser])

  function updateLoginForm(event) {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  function updateForm(setForm) {
    return (event) => {
      const { name, value } = event.target
      setForm((current) => ({ ...current, [name]: value }))
    }
  }

  async function addMember(event) {
    event.preventDefault()

    if (!memberForm.full_name || !memberForm.phone || !memberForm.email || !memberForm.address || !memberForm.national_id) {
      setMessage('Fill all member details before saving.')
      return
    }

    try {
      const savedMember = await request('/members/', {
        method: 'POST',
        body: JSON.stringify(memberForm),
      })

      setMembers((current) => [...current, savedMember])
      setMemberForm(emptyMember)
      setMessage('Member saved successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addSaving(event) {
    event.preventDefault()

    if (!savingForm.memberId || !savingForm.amount) {
      setMessage('Select member and enter amount.')
      return
    }

    try {
      const savedSaving = await request('/savings/', {
        method: 'POST',
        body: JSON.stringify({
          member: Number(savingForm.memberId),
          amount: savingForm.amount,
        }),
      })

      setSavings((current) => [...current, normalizeSaving(savedSaving)])
      setSavingForm(emptySaving)
      setMessage('Saving record saved successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addLoan(event) {
    event.preventDefault()

    if (!loanForm.memberId || !loanForm.amount || !loanForm.interest_rate || !loanForm.duration) {
      setMessage('Fill all loan details before saving.')
      return
    }

    try {
      const savedLoan = await request('/loans/', {
        method: 'POST',
        body: JSON.stringify({
          member: Number(loanForm.memberId),
          amount: loanForm.amount,
          interest_rate: loanForm.interest_rate,
          duration: Number(loanForm.duration),
          status: loanForm.status,
        }),
      })

      setLoans((current) => [...current, normalizeLoan(savedLoan)])
      setLoanForm(emptyLoan)
      setMessage('Loan saved successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addRepayment(event) {
    event.preventDefault()

    if (!repaymentForm.loanId || !repaymentForm.amount_paid) {
      setMessage('Select loan and enter amount paid.')
      return
    }

    try {
      const savedRepayment = await request('/repayments/', {
        method: 'POST',
        body: JSON.stringify({
          loan: Number(repaymentForm.loanId),
          amount_paid: repaymentForm.amount_paid,
        }),
      })

      setRepayments((current) => [...current, normalizeRepayment(savedRepayment)])
      setRepaymentForm(emptyRepayment)
      setMessage('Repayment saved successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function memberName(id) {
    return members.find((member) => member.id === Number(id))?.full_name || 'Unknown'
  }

  const totals = useMemo(() => ({
    members: members.length,
    savings: savings.reduce((sum, item) => sum + Number(item.amount), 0),
    loans: loans.reduce((sum, item) => sum + Number(item.amount), 0),
    repayments: repayments.reduce((sum, item) => sum + Number(item.amount_paid), 0),
  }), [members, savings, loans, repayments])

  const selectedUser = members.find((member) => member.phone === phone)
  const userSavings = selectedUser
    ? savings.filter((item) => item.memberId === selectedUser.id)
    : []
  const userLoans = selectedUser
    ? loans.filter((item) => item.memberId === selectedUser.id)
    : []
  const userRepayments = selectedUser
    ? repayments.filter((item) => userLoans.some((loan) => loan.id === item.loanId))
    : []

  if (!authUser) {
    return (
      <div className="app auth-page">
        <div className="auth-card">
          <h1>Mobile Savings & Loan System</h1>
          <p>Login as admin or member.</p>
          {message && <p className="message">{message}</p>}
          <form className="auth-form" onSubmit={handleLogin}>
            <input name="username" onChange={updateLoginForm} placeholder="Username" value={loginForm.username} />
            <input name="password" onChange={updateLoginForm} placeholder="Password" type="password" value={loginForm.password} />
            <button disabled={authLoading} type="submit">{authLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-top">
          <h1>Mobile Savings and Loan Management System</h1>
          <div className="header-actions">
            <span>Welcome, {authUser.username}</span>
            <button onClick={handleLogout} type="button">Logout</button>
          </div>
        </div>
        <div className="side-buttons">
          <button className={side === 'admin' ? 'active' : ''} onClick={() => setSide('admin')} type="button">
            Admin Dashboard
          </button>
          <button className={side === 'mobile' ? 'active' : ''} onClick={() => setSide('mobile')} type="button">
            Mobile User
          </button>
        </div>
      </header>

      {message && <p className="message">{message}</p>}
      {loading && <p className="message">Loading data...</p>}

      {side === 'admin' ? (
        <div className="admin-layout">
          <aside className="menu">
            {['dashboard', 'members', 'savings', 'loans', 'repayments'].map((item) => (
              <button
                className={page === item ? 'active' : ''}
                key={item}
                onClick={() => setPage(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </aside>

          <main className="content">
            {page === 'dashboard' && (
              <section>
                <h2>Dashboard</h2>
                <div className="cards">
                  <div className="card"><span>Members</span><b>{totals.members}</b></div>
                  <div className="card"><span>Savings</span><b>{money(totals.savings)}</b></div>
                  <div className="card"><span>Loans</span><b>{money(totals.loans)}</b></div>
                  <div className="card"><span>Repayments</span><b>{money(totals.repayments)}</b></div>
                </div>
              </section>
            )}

            {page === 'members' && (
              <section>
                <h2>Members</h2>
                <form className="form" onSubmit={addMember}>
                  <input name="full_name" onChange={updateForm(setMemberForm)} placeholder="Full name" value={memberForm.full_name} />
                  <select name="gender" onChange={updateForm(setMemberForm)} value={memberForm.gender}>
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                  <input name="phone" onChange={updateForm(setMemberForm)} placeholder="Phone number" value={memberForm.phone} />
                  <input name="email" onChange={updateForm(setMemberForm)} placeholder="Email" value={memberForm.email} />
                  <input name="address" onChange={updateForm(setMemberForm)} placeholder="Address" value={memberForm.address} />
                  <input name="national_id" onChange={updateForm(setMemberForm)} placeholder="National ID" value={memberForm.national_id} />
                  <button type="submit">Save member</button>
                </form>

                <SimpleTable
                  columns={['Name', 'Gender', 'Phone', 'National ID', 'Date']}
                  rows={members.map((member) => [
                    member.full_name,
                    member.gender,
                    member.phone,
                    member.national_id,
                    member.registration_date,
                  ])}
                />
              </section>
            )}

            {page === 'savings' && (
              <section>
                <h2>Savings</h2>
                <form className="form small" onSubmit={addSaving}>
                  <MemberSelect members={members} name="memberId" onChange={updateForm(setSavingForm)} value={savingForm.memberId} />
                  <input name="amount" onChange={updateForm(setSavingForm)} placeholder="Amount" type="number" value={savingForm.amount} />
                  <button type="submit">Save deposit</button>
                </form>

                <SimpleTable
                  columns={['Member', 'Amount', 'Date']}
                  rows={savings.map((item) => [memberName(item.memberId), money(item.amount), item.deposit_date])}
                />
              </section>
            )}

            {page === 'loans' && (
              <section>
                <h2>Loans</h2>
                <form className="form" onSubmit={addLoan}>
                  <MemberSelect members={members} name="memberId" onChange={updateForm(setLoanForm)} value={loanForm.memberId} />
                  <input name="amount" onChange={updateForm(setLoanForm)} placeholder="Amount" type="number" value={loanForm.amount} />
                  <input name="interest_rate" onChange={updateForm(setLoanForm)} placeholder="Interest rate" type="number" value={loanForm.interest_rate} />
                  <input name="duration" onChange={updateForm(setLoanForm)} placeholder="Duration in months" type="number" value={loanForm.duration} />
                  <select name="status" onChange={updateForm(setLoanForm)} value={loanForm.status}>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                  <button type="submit">Save loan</button>
                </form>

                <SimpleTable
                  columns={['Member', 'Amount', 'Rate', 'Duration', 'Status']}
                  rows={loans.map((loan) => [
                    memberName(loan.memberId),
                    money(loan.amount),
                    `${loan.interest_rate}%`,
                    `${loan.duration} months`,
                    loan.status,
                  ])}
                />
              </section>
            )}

            {page === 'repayments' && (
              <section>
                <h2>Repayments</h2>
                <form className="form small" onSubmit={addRepayment}>
                  <select name="loanId" onChange={updateForm(setRepaymentForm)} value={repaymentForm.loanId}>
                    <option value="">Select loan</option>
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {memberName(loan.memberId)} - {money(loan.amount)}
                      </option>
                    ))}
                  </select>
                  <input name="amount_paid" onChange={updateForm(setRepaymentForm)} placeholder="Amount paid" type="number" value={repaymentForm.amount_paid} />
                  <button type="submit">Save repayment</button>
                </form>

                <SimpleTable
                  columns={['Member', 'Amount paid', 'Date']}
                  rows={repayments.map((item) => {
                    const loan = loans.find((record) => record.id === item.loanId)
                    return [memberName(loan?.memberId), money(item.amount_paid), item.payment_date]
                  })}
                />
              </section>
            )}
          </main>
        </div>
      ) : (
        <main className="mobile-page">
          <section className="phone-box">
            <h2>Member Mobile View</h2>
            <p>Enter phone number used during registration.</p>
            <input onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" value={phone} />
          </section>

          {selectedUser ? (
            <section className="phone-box">
              <h3>{selectedUser.full_name}</h3>
              <p>Phone: {selectedUser.phone}</p>
              <div className="cards">
                <div className="card"><span>Savings</span><b>{money(userSavings.reduce((sum, item) => sum + Number(item.amount), 0))}</b></div>
                <div className="card"><span>Loans</span><b>{money(userLoans.reduce((sum, item) => sum + Number(item.amount), 0))}</b></div>
                <div className="card"><span>Paid</span><b>{money(userRepayments.reduce((sum, item) => sum + Number(item.amount_paid), 0))}</b></div>
              </div>
              <h3>My loans</h3>
              <SimpleTable
                columns={['Amount', 'Status', 'Date']}
                rows={userLoans.map((loan) => [money(loan.amount), loan.status, loan.application_date])}
              />
            </section>
          ) : (
            <p className="empty">No member found.</p>
          )}
        </main>
      )}
    </div>
  )
}

function MemberSelect({ members, name, onChange, value }) {
  return (
    <select name={name} onChange={onChange} value={value}>
      <option value="">Select member</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.full_name}
        </option>
      ))}
    </select>
  )
}

function SimpleTable({ columns, rows }) {
  if (rows.length === 0) {
    return <p className="empty">No records yet.</p>
  }

  return (
    <div className="table-area">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
