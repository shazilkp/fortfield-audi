'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [light,setLight] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // On success, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (light? (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center md:bg-center bg-no-repeat bg-gradient-to-b from-pink-300 via-purple-300 to-blue-300 px-2 text-white"
    style={{ backgroundImage: "url('/2.jpg')" }}>
  <form
    className="backdrop-blur-sm bg-white/10 p-8 rounded-2xl shadow-xl border border-white/30 w-full max-w-sm text-white"
    onSubmit={handleSubmit}
  >
    <h2 className="text-2xl font-bold mb-1.5">Sign In</h2>
    <div className="border-t-4 border-white/90 mb-6 w-1/4 rounded-full"></div>

    {error && <div className="mb-4 text-red-300">{error}</div>}
    
    <div className="mb-4">
      <label className="block mb-1 font-medium" htmlFor="email">
      </label>
      <input
        className="w-full bg-white/20 border border-white/30 px-3 py-2 rounded-full placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white inset-shadow-xs inset-shadow-white/50"
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoFocus
        placeholder="you@example.com"
      />
    </div>
    
    <div className="mb-6">
      <label className="block mb-1 font-medium" htmlFor="password">
      </label>
      <input
        className="w-full bg-white/20 border border-white/30 px-3 py-2 rounded-full placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white inset-shadow-xs inset-shadow-white/50"
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        placeholder="Password"
      />
    </div>
    
    <button
      className="px-7 bg-white/90 hover:bg-white/30 hover:text-white text-slate-700 py-2 rounded-full font-semibold transition-colors"
      type="submit"
      disabled={loading}
    >
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
    
    
  </form>
</div>) : (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-fuchsia-950 to-sky-950 px-2 text-white">
  <form
    className="backdrop-blur-lg bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-sm text-white"
    onSubmit={handleSubmit}
  >
    <h2 className="text-2xl font-bold mb-1.5">Sign In</h2>
    <div className="border-t-4 border-white/30 mb-6 w-1/4 rounded-full"></div>

    {error && <div className="mb-4 text-red-400">{error}</div>}

    <div className="mb-4">
      <label className="block mb-1 font-medium" htmlFor="email">
      </label>
      <input
        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-full placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white inset-shadow-xs inset-shadow-white/50"
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoFocus
        placeholder="you@example.com"
      />
    </div>

    <div className="mb-6">
      <label className="block mb-1 font-medium" htmlFor="password">
      </label>
      <input
        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-full placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white inset-shadow-xs inset-shadow-white/50"
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        placeholder="Password"
      />
    </div>

    <button
      className="px-7 bg-white/20 hover:bg-white/40 text-white py-2 rounded-full font-semibold transition-colors"
      type="submit"
      disabled={loading}
    >
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
  </form>
</div>)


  );
}



