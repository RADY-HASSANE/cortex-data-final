
import React, { useState } from 'react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      addToast(t('profile.passwordMatchError'), 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast(t('profile.passwordLengthError'), 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await (supabase.auth as any).updateUser({
        password: newPassword
      });

      if (error) throw error;

      addToast(t('profile.passwordSuccess'), 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      addToast(error.message || t('profile.updateError'), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header Navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-brand-600 font-semibold text-sm mb-8 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('common.back')}
        </button>

        <div className="space-y-8">
          {/* Profile Hero Card */}
          <div className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-4xl text-white shadow-lg shadow-brand-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('profile.title')}</h1>
              <p className="text-gray-500 font-medium">{t('profile.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-500 rounded-full"></div>
                {t('profile.personalInfo')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('auth.fullName')}</label>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">{displayName}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('auth.email')}</label>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-secondary-500 rounded-full"></div>
                {t('profile.security')}
              </h2>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('profile.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating || !newPassword}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      {t('profile.changePassword')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-brand-50 rounded-3xl p-6 border border-brand-100 flex items-start gap-4">
            <div className="bg-brand-500 text-white p-2 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.854 1.5-2.418a1.5 1.5 0 11-3 0c.842.564 1.5 1.435 1.5 2.418V18zm-4.5 0v-.192c0-.983.658-1.854 1.5-2.418a1.5 1.5 0 11-3 0c.842.564 1.5 1.435 1.5 2.418V18z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-brand-900 font-bold">Conseil de sécurité</h4>
              <p className="text-brand-700 text-sm">Utilisez un mot de passe unique contenant des lettres, des chiffres et des symboles pour protéger votre progression sur EduDataScience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
