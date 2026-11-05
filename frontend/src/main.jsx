import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Activity,
  ArrowRight,
  Brain,
  HeartPulse,
  Info,
  Languages,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const defaultDashboard = {
  stats: {
    students_seen: 248,
    pending_review: 17,
    high_priority: 5,
    response_rate: 91,
    support_hours: 'Mon-Sat, 9:00 AM - 6:00 PM',
    last_updated: '2026-11-05T09:30:00Z',
  },
  alerts: [
    '3 cases require weekly counsellor review.',
    '1 urgent case flagged for immediate support.',
    'Follow-up reminder sent for 6 resolved cases.',
  ],
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('counsellor');
  const [email, setEmail] = useState('admin@scsvmv.edu');
  const [password, setPassword] = useState('wellness123');
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [text, setText] = useState('I feel stressed about my semester exams');
  const [language, setLanguage] = useState('auto');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API}/dashboard/summary`);
      if (!response.ok) throw new Error('Unable to load dashboard data');
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setDashboard(defaultDashboard);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchDashboard();
  }, [loggedIn]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    const valid = email.includes('@') && password.length >= 6;
    if (!valid) {
      setError('Use a valid email and a password with at least 6 characters.');
      return;
    }

    setError('');
    setLoggedIn(true);
    setRole(email.toLowerCase().includes('admin') ? 'admin' : 'counsellor');
  }

  async function submit(e) {
    e.preventDefault();
    if (text.trim().length < 3) return;
    setBusy(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API}/nlp/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error('API request failed. Check that the backend is running.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, Arial, sans-serif; background: #f4f7f4; color: #18342d; }
        button, input, select, textarea { font: inherit; }
        .app-shell { min-height: 100vh; background: linear-gradient(180deg, #f5faf6 0%, #edf6f0 100%); }
        .auth-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top left, rgba(129, 179, 151, 0.2), transparent 25%), #f4f7f4; }
        .login-card { width: min(100%, 420px); background: rgba(255,255,255,0.9); border: 1px solid #dfe9e2; border-radius: 24px; padding: 28px; box-shadow: 0 18px 50px rgba(21, 52, 44, 0.08); }
        .brand-lockup { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .brand-icon { width: 46px; height: 46px; border-radius: 14px; background: #183f36; color: white; display: grid; place-items: center; }
        .brand-name { font-size: 14px; letter-spacing: 0.18em; font-weight: 700; color: #4d665f; }
        .brand-title { font-size: 28px; letter-spacing: -0.05em; font-weight: 700; margin: 0; }
        .login-card h2 { font-size: 24px; margin: 12px 0 8px; }
        .login-card p { margin: 0 0 18px; color: #536d65; }
        .field { display: grid; gap: 8px; margin-bottom: 14px; }
        .field label { font-size: 12px; color: #335249; font-weight: 700; }
        .field input, .field select, .field textarea { width: 100%; border: 1px solid #d4dfd7; border-radius: 12px; padding: 12px 13px; background: white; color: #163d36; }
        .login-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
        .primary-button, .secondary-button { border: 0; border-radius: 12px; padding: 12px 16px; font-weight: 700; cursor: pointer; transition: 0.2s ease; }
        .primary-button { background: linear-gradient(135deg, #1d4c43, #2d6d62); color: white; }
        .primary-button:hover { transform: translateY(-1px); }
        .secondary-button { background: #edf5f1; color: #163d36; }
        .tiny-note { font-size: 12px; color: #5c736b; margin-top: 12px; }
        .error-box { margin-top: 14px; background: #fff2f2; border: 1px solid #f7d1d1; color: #973b3b; border-radius: 12px; padding: 10px 12px; font-size: 14px; }

        .dashboard-shell { padding: 24px; min-height: 100vh; }
        .topbar { max-width: 1200px; margin: 0 auto 20px; display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; background: rgba(255,255,255,0.9); border: 1px solid #dfeae2; border-radius: 18px; }
        .brand-row { display: flex; align-items: center; gap: 12px; }
        .topbar .brand-icon { width: 40px; height: 40px; }
        .topbar .brand-title { font-size: 22px; }
        .topbar-actions { display: flex; align-items: center; gap: 10px; }
        .pill { background: #edf5f1; padding: 8px 10px; border-radius: 999px; color: #234c43; font-size: 12px; font-weight: 700; }
        .content-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 22px; }
        .side-panel, .main-panel { background: rgba(255,255,255,0.9); border: 1px solid #dfeae2; border-radius: 22px; padding: 20px; }
        .side-panel h3, .main-panel h3 { margin: 0 0 12px; font-size: 18px; }
        .nav-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .nav-list li { background: #f4faf5; border-radius: 12px; padding: 11px 12px; color: #274d45; font-weight: 600; }
        .alert-box { margin-top: 20px; border-radius: 14px; background: #fff9ef; border: 1px solid #f2ddbb; padding: 12px; color: #7b5c22; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .metric-card { background: linear-gradient(180deg, #ffffff, #f8fbf9); border: 1px solid #dfeae2; border-radius: 18px; padding: 18px; }
        .metric-card .label { font-size: 12px; letter-spacing: 0.12em; color: #6a8175; text-transform: uppercase; }
        .metric-card .value { font-size: 28px; font-weight: 700; margin: 8px 0 6px; }
        .metric-card .sub { color: #5c7266; font-size: 13px; }
        .split-panel { margin-top: 22px; display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 18px; }
        .smart-card { background: linear-gradient(180deg, #ffffff, #f8faf8); border: 1px solid #dfeae2; border-radius: 20px; padding: 18px; }
        .smart-card textarea { width: 100%; min-height: 140px; resize: vertical; border: 1px solid #d4dfd7; border-radius: 12px; padding: 12px 13px; margin-top: 14px; }
        .row { display: flex; gap: 12px; margin-top: 12px; }
        .row > * { flex: 1; }
        .table-wrap { overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #edf1ee; font-size: 14px; }
        th { color: #5f7067; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
        .status-badge { display: inline-block; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .status-review { background: #fff4de; color: #916300; }
        .status-escalated { background: #ffe9e7; color: #a54c41; }
        .status-resolved { background: #e8f8eed; color: #2d7259; }
        .result-box { margin-top: 18px; background: #edf9f0; border: 1px solid #d5ebd9; border-radius: 16px; padding: 16px; }
        .result-box h4 { margin: 0 0 8px; font-size: 22px; }
        .result-meta { color: #496760; font-size: 13px; margin-bottom: 8px; }
        .review-note { margin-top: 12px; background: #fffaf0; border-left: 4px solid #f0c96b; padding: 10px 12px; color: #705b2a; border-radius: 10px; }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .split-panel { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .stats-grid { grid-template-columns: 1fr; }
          .topbar { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>

      {!loggedIn ? (
        <div className="auth-shell">
          <div className="login-card">
            <div className="brand-lockup">
              <div className="brand-icon"><HeartPulse size={22} /></div>
              <div>
                <div className="brand-name">SCSVMV</div>
                <div className="brand-title">Wellness</div>
              </div>
            </div>

            <h2>Campus support portal</h2>
            <p>Secure login for counsellors and wellness staff.</p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@scsvmv.edu" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="login-actions">
                <button type="submit" className="primary-button">Sign in</button>
                <span className="tiny-note"><Lock size={14} /> Demo access</span>
              </div>
            </form>

            {error && <div className="error-box">{error}</div>}
            <div className="tiny-note">Try admin@scsvmv.edu / wellness123</div>
          </div>
        </div>
      ) : (
        <div className="dashboard-shell">
          <header className="topbar">
            <div className="brand-row">
              <div className="brand-icon"><HeartPulse size={20} /></div>
              <div>
                <div className="brand-name">SCSVMV</div>
                <div className="brand-title">Student Wellness</div>
              </div>
            </div>

            <div className="topbar-actions">
              <span className="pill">{role === 'admin' ? 'Admin access' : 'Counsellor dashboard'}</span>
              <button className="secondary-button" onClick={() => setLoggedIn(false)}>Sign out</button>
            </div>
          </header>

          <div className="content-grid">
            <aside className="side-panel">
              <h3>Quick navigation</h3>
              <ul className="nav-list">
                <li>Overview</li>
                <li>AI classification</li>
                <li>Student follow-ups</li>
                <li>High-risk review</li>
                <li>Reports</li>
              </ul>

              <div className="alert-box">
                <strong>Campus note:</strong> 3 follow-up alerts need attention today.
              </div>
            </aside>

            <main className="main-panel">
              <h3>Wellness overview</h3>

              <div className="stats-grid">
                <div className="metric-card">
                  <div className="label">Students seen</div>
                  <div className="value">{dashboard.stats.students_seen}</div>
                  <div className="sub">This month</div>
                </div>
                <div className="metric-card">
                  <div className="label">Pending review</div>
                  <div className="value">{dashboard.stats.pending_review}</div>
                  <div className="sub">Needs attention</div>
                </div>
                <div className="metric-card">
                  <div className="label">High priority</div>
                  <div className="value">{dashboard.stats.high_priority}</div>
                  <div className="sub">Urgent cases</div>
                </div>
                <div className="metric-card">
                  <div className="label">Response rate</div>
                  <div className="value">{dashboard.stats.response_rate}%</div>
                  <div className="sub">Within 48 hours</div>
                </div>
              </div>

              <div className="split-panel">
                <div className="smart-card">
                  <div className="brand-row" style={{ marginBottom: 8 }}>
                    <Brain size={18} />
                    <strong>AI student concern classifier</strong>
                  </div>

                  <form onSubmit={submit}>
                    <div className="field">
                      <label>Preferred language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="auto">Auto detect</option>
                        <option value="en">English</option>
                        <option value="te">తెలుగు</option>
                        <option value="ta">தமிழ்</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Student message</label>
                      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe what the student is experiencing..." />
                    </div>

                    <button className="primary-button" type="submit" disabled={busy || text.trim().length < 3}>
                      {busy ? 'Analysing…' : 'Classify concern'} <ArrowRight size={16} />
                    </button>
                  </form>

                  {error && <div className="error-box">{error}</div>}

                  {result && (
                    <div className="result-box">
                      <h4>{result.category}</h4>
                      <div className="result-meta">
                        Model: {result.model} · Language: {result.language} · Confidence: {(result.confidence * 100).toFixed(1)}%
                      </div>
                      <div>{result.message}</div>
                      {result.needs_human_review && (
                        <div className="review-note">
                          <Info size={16} style={{ verticalAlign: 'sub', marginRight: 6 }} />
                          Human review recommended for this case.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="smart-card">
                  <div className="brand-row" style={{ marginBottom: 12 }}>
                    <TrendingUp size={18} />
                    <strong>Recent cases</strong>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.alerts && (
                          <>
                            <tr>
                              <td>A. Meena</td>
                              <td>Academic Stress</td>
                              <td><span className="status-badge status-review">In review</span></td>
                            </tr>
                            <tr>
                              <td>R. Kavya</td>
                              <td>Sleep Issues</td>
                              <td><span className="status-badge status-escalated">Escalated</span></td>
                            </tr>
                            <tr>
                              <td>S. Arjun</td>
                              <td>Emotional Support</td>
                              <td><span className="status-badge status-resolved">Resolved</span></td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
