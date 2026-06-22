import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  Award, 
  FileText, 
  Database, 
  Layers, 
  Send, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  LogIn 
} from "lucide-react";
import { motion } from "motion/react";

interface AuthPageProps {
  onAuthSuccess: (token: string, user: { id: string; email: string; name: string }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please check your credentials.");
      }

      // Save token & user
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    // Attempt registration first. If exists, login.
    const demoPayload = {
      email: "demo@formforge.io",
      password: "DemoUser123!",
      name: "FormForge Demo User",
    };

    try {
      // Try registering
      let res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoPayload),
      });

      let data = await res.json();
      if (!res.ok) {
        // If already exists, attempt login
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: demoPayload.email, password: demoPayload.password }),
        });
        data = await res.json();
      }

      if (res.ok) {
        onAuthSuccess(data.token, data.user);
      } else {
        throw new Error(data.error || "Demo login failed.");
      }
    } catch (err: any) {
      setError("Demo access failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      
      {/* BRAND & TASK TASK INFO CARDS */}
      <div className="w-full md:w-1/2 p-6 md:p-12 bg-[#f8fafc] flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
        
        {/* Header Branding */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="font-extrabold text-white text-xl tracking-tighter">FF</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="font-sans font-black text-2xl text-slate-800 tracking-tight">FORM</span>
                <span className="font-sans font-semibold text-blue-600 tracking-wide text-lg">FORGE</span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Personal Portfolio Project</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-semibold tracking-wider uppercase font-mono">
              Full Stack Development
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-850 tracking-tight leading-none mt-2">
              DYNAMIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-850">FORM BUILDER</span>
            </h1>
            <p className="text-slate-600 max-w-lg text-sm md:text-base leading-relaxed">
              Build a polished web application allowing users to create, customize, and share structures of dynamic fields, collect responses in real-time, and view analytics dashboards.
            </p>
          </div>
        </div>

        {/* Task Features and Details from PNG specs */}
        <div className="my-8 space-y-4 max-w-lg">
          <h2 className="text-xs uppercase font-mono tracking-widest text-blue-600 font-bold">Requirement Focus</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start space-x-3 shadow-sm hover:shadow-md transition-shadow">
              <Layers className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Drag & Dynamic Fields</h3>
                <p className="text-[11px] text-slate-500">Add Text, Email, textareas, drop-downs, date selectors, checkboxes, radios.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start space-x-3 shadow-sm hover:shadow-md transition-shadow">
              <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Form Sharing</h3>
                <p className="text-[11px] text-slate-500">Create unique public links instantly. Anyone can submit in real-time.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start space-x-3 shadow-sm hover:shadow-md transition-shadow">
              <Database className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Real-Time Submissions</h3>
                <p className="text-[11px] text-slate-500">Server-side storage checks bounds and persists client's input.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start space-x-3 shadow-sm hover:shadow-md transition-shadow">
              <Award className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Stats & Export</h3>
                <p className="text-[11px] text-slate-500">Visual responses telemetry, dashboard charts and CSV export mechanics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info branding */}
        <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>FormForge Build © 2026</span>
          <span className="flex items-center text-blue-600/80 gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Empowering Skills
          </span>
        </div>
      </div>

      {/* LOGIN / SIGNUP CONTROL PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative overflow-hidden">
        
        {/* Soft elegant ambient background orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-slate-505 text-sm mt-1.5">
              {isLogin ? "Log in to manage and build your dynamic forms." : "Sign up to start building, sharing, and tracking form responses."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Separation line for Demo */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-white px-3 text-slate-400">Evaluation Mode</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2.5"
          >
            <Play className="h-4 w-4 fill-blue-600 text-blue-600" />
            <span>Instant Demo Log In (Evaluator)</span>
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
