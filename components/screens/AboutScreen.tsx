
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface AboutScreenProps {
  onBack: () => void;
}

const NodeCard = ({ icon, title, items, colorClass, delay }: { icon: string, title: string, items: string[], colorClass: string, delay: string }) => (
  <div 
    className={`p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-soft relative z-10 animate-slide-up w-full md:w-64 hover:shadow-xl transition-all duration-500 group border-b-4 ${colorClass.split(' ')[0] === 'bg-brand-50' ? 'border-b-brand-500' : ''}`}
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
      {icon}
    </div>
    <h4 className="font-black text-gray-900 text-sm mb-3 leading-tight uppercase tracking-tight">{title}</h4>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0 animate-pulse"></div>
          <span className="text-[11px] text-gray-600 font-semibold leading-tight">{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 animate-fade-in relative">
      {/* Background Pattern - Hexagons Tech Style */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60v-40z' fill-rule='evenodd' stroke='%23000' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '80px' }}></div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold text-sm mb-12 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('common.back')}
        </button>

        <div className="space-y-20">
          {/* Header */}
          <div className="text-center space-y-4">
             <div className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-brand-100">
                Full Stack Architecture
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
               Grand Schéma d'Intelligence
             </h1>
             <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
               Découvrez comment nous orchestrons les données pour transformer chaque question en une expérience d'apprentissage unique.
             </p>
          </div>

          {/* Large Radial Architecture Schema */}
          <div className="relative min-h-[800px] md:min-h-[900px] flex items-center justify-center py-20 overflow-visible">
            
            {/* Center Brain Core */}
            <div className="relative z-20 group">
              <div className="w-40 h-40 md:w-64 md:h-64 bg-white rounded-full border-8 border-brand-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center text-center p-8 transform transition-transform group-hover:scale-110 duration-700 animate-pulse-slow">
                 <div className="text-6xl md:text-8xl mb-3 drop-shadow-lg">🧠</div>
                 <h2 className="font-black text-brand-700 text-sm md:text-xl tracking-tighter uppercase leading-none">Cortex Data</h2>
                 <div className="h-1 w-12 bg-secondary-400 rounded-full my-2"></div>
                 <span className="text-[9px] md:text-[11px] text-gray-400 font-black uppercase tracking-[0.3em]">Orchestrateur Central</span>
              </div>
              <div className="absolute inset-0 bg-brand-400/30 blur-[120px] -z-10 rounded-full animate-pulse"></div>
            </div>

            {/* Desktop View: Radial Connections */}
            <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000">
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Connector Lines */}
                <g className="opacity-40">
                    <path d="M500 500 L250 200" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                    <path d="M500 500 L750 200" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                    <path d="M500 500 L150 500" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                    <path d="M500 500 L850 500" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                    <path d="M500 500 L250 800" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                    <path d="M500 500 L750 800" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="animate-dash" strokeDasharray="15,15" />
                </g>
              </svg>

              {/* Node 1: Capture Multimodale (Input) */}
              <div className="absolute top-[5%] left-[5%] pointer-events-auto">
                <NodeCard 
                  icon="🎙️" 
                  title="Capture Multimodale" 
                  items={["Entrée Textuelle temps réel", "Traitement Grok STT (Audio)", "Normalisation des prompts", "Validation de flux d'entrée"]} 
                  colorClass="bg-blue-50 text-blue-600" 
                  delay="0ms" 
                />
              </div>

              {/* Node 2: Intelligence de Routage (n8n) */}
              <div className="absolute top-[5%] right-[5%] pointer-events-auto">
                <NodeCard 
                  icon="⚖️" 
                  title="Routage n8n" 
                  items={["Classification par Agent IA", "Analyse d'intention sémantique", "Reformulation de requête", "Dispatching vers experts"]} 
                  colorClass="bg-orange-50 text-orange-600" 
                  delay="150ms" 
                />
              </div>

              {/* Node 3: Base de Connaissance (Supabase) */}
              <div className="absolute top-[45%] left-[-2%] pointer-events-auto">
                <NodeCard 
                  icon="📚" 
                  title="Supabase RAG" 
                  items={["Vector Store (Embeddings)", "Stockage Documentaire DS", "Récupération Contexte (RAG)", "Indexation de l'historique"]} 
                  colorClass="bg-cyan-50 text-cyan-600" 
                  delay="300ms" 
                />
              </div>

              {/* Node 4: Unités de Spécialisation (Agents) */}
              <div className="absolute top-[45%] right-[-2%] pointer-events-auto">
                <NodeCard 
                  icon="🛡️" 
                  title="Agents Métiers" 
                  items={["Expert Quiz Interactif", "Générateur d'Exercices Code", "Architecte Mind Map SVG", "Tuteur Théorique DS"]} 
                  colorClass="bg-indigo-50 text-indigo-600" 
                  delay="450ms" 
                />
              </div>

              {/* Node 5: Synthèse de Raisonnement (LLM) */}
              <div className="absolute bottom-[5%] left-[5%] pointer-events-auto">
                <NodeCard 
                  icon="🧠" 
                  title="LLM Core Engine" 
                  items={["Injection Contexte Supabase", "Moteur Gemini Pro/Flash", "Vérification Factuelle (HAL)", "Génération de JSON structuré"]} 
                  colorClass="bg-amber-50 text-amber-600" 
                  delay="600ms" 
                />
              </div>

              {/* Node 6: Expérience Modulaire (UI) */}
              <div className="absolute bottom-[5%] right-[5%] pointer-events-auto">
                <NodeCard 
                  icon="🎨" 
                  title="Frontend Modulaire" 
                  items={["Interface React 19 / Vite", "Composants UI Interactifs", "Visualisation de Données", "Expérience UX/UI Polished"]} 
                  colorClass="bg-rose-50 text-rose-600" 
                  delay="750ms" 
                />
              </div>
            </div>

            {/* Mobile View: Vertical Detailed List */}
            <div className="md:hidden flex flex-col gap-6 w-full mt-10">
              <NodeCard icon="🎙️" title="Capture Multimodale" items={["Grok STT (Audio)", "Texte Prompt"]} colorClass="bg-blue-50 text-blue-600" delay="0ms" />
              <NodeCard icon="⚖️" title="Routage n8n" items={["IA Agent Classificateur", "Intent Analysis"]} colorClass="bg-orange-50 text-orange-600" delay="150ms" />
              <NodeCard icon="📚" title="Supabase RAG" items={["Vector DB", "Sémantique retrieval"]} colorClass="bg-cyan-50 text-cyan-600" delay="300ms" />
              <NodeCard icon="🛡️" title="Agents Métiers" items={["Quiz, Code, MindMap Experts"]} colorClass="bg-indigo-50 text-indigo-600" delay="450ms" />
              <NodeCard icon="🧠" title="LLM Core Engine" items={["Gemini Reasoning", "Contextual Synthesis"]} colorClass="bg-amber-50 text-amber-600" delay="600ms" />
              <NodeCard icon="🎨" title="Frontend Modulaire" items={["React 19 Components", "Interactive UX"]} colorClass="bg-rose-50 text-rose-600" delay="750ms" />
            </div>
          </div>

          {/* Mission Description Card */}
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[150px] rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-1000"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                  Une mission : <br/>
                  <span className="text-brand-400">Démocratiser la Data Science.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Cortex Data n'est pas qu'un chatbot. C'est un écosystème intelligent conçu pour s'adapter à votre rythme, vos doutes et vos ambitions professionnelles.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">RAG Optimized</div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">Multi-Agent System</div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-4">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center text-brand-400 text-xl font-black">24/7</div>
                  <p className="text-sm font-bold text-slate-300">Tuteur disponible à tout moment pour clarifier vos doutes théoriques ou pratiques.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-500/20 rounded-2xl flex items-center justify-center text-secondary-400 text-xl font-black">100%</div>
                  <p className="text-sm font-bold text-slate-300">Contenu généré dynamiquement basé sur des ressources vérifiées et indexées.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-12 border-t border-gray-200/60">
             <div className="flex items-center justify-center gap-4 mb-4 grayscale opacity-50">
                <span className="font-black text-xs tracking-widest uppercase">Powered by</span>
                <span className="font-bold text-xs uppercase">n8n</span>
                <span className="font-bold text-xs uppercase">Supabase</span>
                <span className="font-bold text-xs uppercase">Gemini</span>
                <span className="font-bold text-xs uppercase">Grok</span>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
               © 2025 Cortex Data Core Intelligence
             </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
        .animate-dash {
          animation: dash 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
