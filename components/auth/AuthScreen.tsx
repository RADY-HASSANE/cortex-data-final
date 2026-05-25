
import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';

export const AuthScreen: React.FC = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await (supabase.auth as any).signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await (supabase.auth as any).signUp({
          email,
          password,
          options: {
            data: { name, role: 'user' }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col justify-center items-center p-6">
      {/* Container Principal */}
      <div className="w-full max-w-[400px] animate-fade-in">
        
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 shadow-sm transition-transform hover:scale-105 duration-300">
            <Bot size={32} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Cortex Data
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {isLogin ? "Connectez-vous à votre espace tuteur" : "Créez votre compte d'apprentissage"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">{t('auth.fullName')}</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm"
                placeholder="nom@exemple.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100 animate-slide-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? t('auth.signIn') : t('auth.signUp')
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
            >
              {isLogin ? (
                <>Pas de compte ? <span className="text-brand-600 font-bold ml-1">Inscrivez-vous</span></>
              ) : (
                <>Déjà membre ? <span className="text-brand-600 font-bold ml-1">Connectez-vous</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-10 text-center text-[11px] text-gray-400 font-medium tracking-wide">
         CORTEX TECHNOLOGY
        </p>
      </div>
    </div>
  );
};
