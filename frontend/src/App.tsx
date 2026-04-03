import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Layers, 
  Terminal, 
  Activity, 
  ChevronRight, 
  Cpu, 
  ShieldCheck,
  Server
} from 'lucide-react';
import './index.css';

interface Algorithm {
  id: number;
  name: string;
  performance: string;
}

interface HealthStatus {
  status: string;
  message: string;
}

function App() {
  const [data, setData] = useState<Algorithm[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, healthRes] = await Promise.all([
          fetch('/api/data'),
          fetch('/api/health')
        ]);
        const dataJson = await dataRes.json();
        const healthJson = await healthRes.json();
        setData(dataJson);
        setHealth(healthJson);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container min-h-screen">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-pink-600/10 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass-card px-8 py-3 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white font-accent">Algorithm<span className="text-indigo-500">X</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-slate-400 font-medium tracking-wide">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#benchmarks" className="hover:text-white transition-colors">Benchmarks</a>
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
            {health && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono">SYSTEM: ONLINE</span>
              </div>
            )}
          </div>

          <button className="premium-button text-sm">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide">
                <Activity className="w-4 h-4" />
                <span>V1.0 ALPHA IS NOW LIVE</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
                Next-Gen <br />
                <span className="text-gradient decoration-indigo-500 underline underline-offset-8">Algorithms</span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-xl">
                Experience ultra-low latency data processing with our distributed sorting and search solutions. Designed for high-frequency trading and large-scale AI training.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="premium-button flex items-center gap-2 px-10 py-5 text-lg group">
                  Explore Hub <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-10 py-5 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-semibold backdrop-blur-sm">
                  View Source
                </button>
              </div>
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 p-2 glass-card animate-float">
                <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-mono text-slate-400">algorithm_performance.cli</span>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    {isLoading ? (
                      <div className="py-2 text-indigo-400">Loading neural pathways...</div>
                    ) : (
                      data.map((algo, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          key={algo.id} 
                          className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                          <span className="text-slate-300">$ EXECUTE {algo.name}</span>
                          <span className="text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">{algo.performance}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Blurred Orbs for visuals */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-[80px] -z-1" />
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, label: "Core Processing", value: "0.2ms Latency", desc: "Optimized C++ core engine" },
              { icon: Layers, label: "Data Scalability", value: "10PB+ Ready", desc: "Horizontal sharding enabled" },
              { icon: ShieldCheck, label: "Military-Grade", value: "End-to-End", desc: "Zero-knowledge encryption" }
            ].map((stat, i) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={i} 
                className="glass-card p-8 bg-white/2 border-white/5 hover:bg-white/[0.05] transition-all group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-slate-400 font-semibold mb-2">{stat.label}</h3>
                  <div className="text-3xl font-extrabold mb-2 text-white">{stat.value}</div>
                  <p className="text-sm text-slate-500">{stat.desc}</p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
              </motion.div>
            ))}
          </section>

          {/* Backend Connection Indicator */}
          <footer className="mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-500 text-sm">
                Connected to: <span className="text-slate-300 font-mono">aws-east-1-cluster-x</span>
              </p>
            </div>
            <div className="flex gap-8 text-sm text-slate-500 font-medium">
              <a href="#" className="hover:text-indigo-400">Security</a>
              <a href="#" className="hover:text-indigo-400">API Terms</a>
              <a href="#" className="hover:text-indigo-400">Changelog</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
