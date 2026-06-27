import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Landmark,
  LogIn,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  Users,
  LockKeyhole
} from 'lucide-react';

const rolePresets = [
  {
    id: 'citizen',
    label: 'Citizen',
    description: 'Report & Track Issues',
    email: 'citizen@civictrack.ai',
    password: 'password123',
    accent: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'official',
    label: 'Official',
    description: 'Manage Issues',
    email: 'admin@civictrack.ai',
    password: 'password123',
    accent: 'from-slate-600 to-slate-500'
  },
  {
    id: 'department',
    label: 'Department',
    description: 'Admin Dashboard',
    email: 'staff@civictrack.ai',
    password: 'password123',
    accent: 'from-sky-500 to-cyan-500'
  }
];

const stats = [
  { value: '15.231', label: 'Issues Reported', icon: BadgeCheck },
  { value: '11.478', label: 'Issues Resolved', icon: ShieldCheck },
  { value: '3.2', label: 'Avg. Resolution (Days)', icon: Clock3 },
  { value: '25.431', label: 'Active Citizens', icon: Users }
];

const processSteps = [
  {
    title: 'Report Issue',
    description: 'Upload a photo and describe the issue',
    icon: MapPin,
    accent: 'bg-emerald-500'
  },
  {
    title: 'We Locate It',
    description: 'We capture location and notify the department',
    icon: Landmark,
    accent: 'bg-blue-500'
  },
  {
    title: 'Work In Progress',
    description: 'Officials take action and update progress',
    icon: Building2,
    accent: 'bg-amber-500'
  },
  {
    title: 'Issue Resolved',
    description: 'Work completed and you are notified',
    icon: ShieldCheck,
    accent: 'bg-lime-500'
  }
];

const featureHighlights = [
  { title: 'AI Powered', text: 'Smart issue detection', icon: BadgeCheck },
  { title: 'Real-time', text: 'Live tracking & updates', icon: Clock3 },
  { title: 'Transparent', text: 'Complete visibility for everyone', icon: ShieldCheck },
  { title: 'Secure', text: 'Your data is safe with us', icon: LockKeyhole }
];

export default function Login({ onRegisterRedirect }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('citizen@civictrack.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('citizen');

  const activePreset = rolePresets.find((preset) => preset.id === selectedRole) || rolePresets[0];

  const selectPreset = (preset) => {
    setSelectedRole(preset.id);
    setEmail(preset.email);
    setPassword(preset.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (preset) => {
    setError('');
    setLoading(true);

    try {
      await login(preset.email, preset.password);
    } catch (err) {
      setError('Quick login failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#081233] text-white">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(135deg,_#091338_0%,_#102a66_50%,_#0c1539_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-15" />
        <div className="absolute -top-16 left-12 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-4 right-16 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:gap-10">
            <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(1,6,20,0.5)] backdrop-blur-xl sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_35%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/20">
                      <MapPin className="text-emerald-300" size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        CivicTrack <span className="text-emerald-300">AI</span>
                      </h1>
                      <p className="mt-1 text-xs text-white/70 sm:text-sm">Smart Infrastructure Reporting & Tracking</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/[0.85] shadow-sm backdrop-blur-md transition hover:bg-white/[0.14]"
                >
                  <span className="text-base">🇮🇳</span>
                  <span>India</span>
                  <ChevronDown size={16} className="opacity-70" />
                </button>
              </div>

              <div className="relative mt-12 max-w-2xl">
                <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Building Better Cities
                  <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    Together
                  </span>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                  Report infrastructure issues, track progress, and help your city become better every day.
                </p>
              </div>

              <div className="relative mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-lg shadow-black/[0.15] backdrop-blur-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                        <Icon size={20} />
                      </div>
                      <div className="mt-6 text-2xl font-bold text-white">{stat.value}</div>
                      <p className="mt-2 text-sm text-white/70">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-8 rounded-[28px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_18px_60px_rgba(1,6,20,0.35)] backdrop-blur-sm sm:p-6">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-base font-semibold">How It Works</p>
                    <p className="text-sm text-white/60">From report to resolution in four steps</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-4">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div key={step.title} className="relative rounded-2xl bg-white/5 p-4 ring-1 ring-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${step.accent} text-white`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white/45">0{index + 1}</div>
                            <h3 className="text-sm font-bold text-white">{step.title}</h3>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/65">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[24px] border border-emerald-300/10 bg-emerald-300/10 p-5 text-sm text-white/[0.85] backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <BadgeCheck size={18} />
                    </div>
                    <div>
                      <p className="font-semibold">Transparent • Accountable • Efficient</p>
                      <p className="text-white/60">Creating smarter cities through technology & collaboration</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white p-4 text-slate-700 shadow-[0_18px_60px_rgba(1,6,20,0.18)]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featureHighlights.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <div key={feature.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{feature.title}</p>
                            <p className="text-sm font-medium text-slate-700">{feature.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="overflow-hidden rounded-[34px] bg-white text-slate-900 shadow-[0_40px_120px_rgba(1,6,20,0.4)]">
                <div className="bg-[linear-gradient(180deg,#f9fcff_0%,#ffffff_100%)] px-6 pt-8 sm:px-8 sm:pt-10">
                  <div className="flex justify-center">
                    <div className="relative h-32 w-full max-w-md">
                      <div className="absolute inset-x-0 top-0 mx-auto h-28 w-60 rounded-full bg-sky-100 blur-2xl" />
                      <div className="absolute inset-x-8 top-6 h-16 rounded-full bg-emerald-100/90" />
                      <div className="absolute inset-x-14 top-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                        <ShieldCheck size={36} />
                      </div>
                      <div className="absolute bottom-1 left-4 right-4 flex items-end justify-between opacity-80">
                        <div className="h-14 w-6 rounded-t-md bg-sky-200" />
                        <div className="h-20 w-9 rounded-t-md bg-sky-300" />
                        <div className="h-16 w-6 rounded-t-md bg-sky-200" />
                        <div className="h-24 w-10 rounded-t-md bg-sky-400" />
                        <div className="h-18 w-7 rounded-t-md bg-sky-300" />
                        <div className="h-14 w-6 rounded-t-md bg-sky-200" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Welcome Back!</h2>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">Sign in to your CivicTrack AI account</p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-1">
                    {rolePresets.map((preset) => {
                      const selected = selectedRole === preset.id;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => selectPreset(preset)}
                          className={`rounded-xl border px-3 py-3 text-center transition ${
                            selected
                              ? 'border-emerald-300 bg-white shadow-sm'
                              : 'border-transparent bg-transparent text-slate-500 hover:bg-white/80'
                          }`}
                        >
                          <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${preset.accent} text-white shadow-sm`}>
                            {preset.id === 'citizen' ? <Users size={16} /> : preset.id === 'official' ? <Building2 size={16} /> : <Landmark size={16} />}
                          </div>
                          <div className="text-sm font-bold text-slate-800">{preset.label}</div>
                          <div className="text-xs text-slate-500">{preset.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  {error && (
                    <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-4 text-rose-700 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-lg">⚠️</div>
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4 pb-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-slate-700">Password</label>
                        <button
                          type="button"
                          className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                          onClick={() => setError('')}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      Remember me
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
                      <p className="relative mx-auto w-fit bg-white px-4 text-sm text-slate-500">Or continue with</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Google', color: 'text-slate-700', border: 'border-slate-200' },
                        { label: 'Facebook', color: 'text-slate-700', border: 'border-slate-200' },
                        { label: 'Mobile', color: 'text-slate-700', border: 'border-slate-200' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={`flex items-center justify-center gap-2 rounded-2xl border ${item.border} bg-white px-4 py-3 text-sm font-semibold ${item.color} transition hover:bg-slate-50`}
                        >
                          <Smartphone size={16} className="text-emerald-500" />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="text-center text-sm text-slate-500">
                      Don't have an account?{' '}
                      <button onClick={onRegisterRedirect} type="button" className="font-bold text-emerald-600 transition hover:text-emerald-700">
                        Sign up as a Citizen
                      </button>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                        Demo Portal Quick Login Credentials
                      </p>
                      <div className="mt-4 space-y-3">
                        {rolePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleQuickLogin(preset)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:shadow-sm"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${preset.accent} text-white shadow-sm`}>
                              {preset.id === 'citizen' ? <Users size={18} /> : preset.id === 'official' ? <Building2 size={18} /> : <Landmark size={18} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-800">
                                {preset.id === 'citizen'
                                  ? 'Sarah Citizen'
                                  : preset.id === 'official'
                                    ? 'Chief Admin Commissioner'
                                    : 'Marcus Specialist (Roads)'}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {preset.email} • {preset.description}
                              </p>
                            </div>
                            <LogIn size={16} className="text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
