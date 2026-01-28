
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { QUESTIONNAIRE_TREE } from './constants';
import { UserResponse, Recommendation, UserInfo } from './types';
import { generateRecommendation } from './services/geminiService';

const BRAND_OUTLINE = { 
  WebkitTextStroke: '0.5px #E30613',
  textStroke: '0.5px #E30613'
};

const Header: React.FC = () => (
  <div className="pt-10 pb-6 text-center print:pt-4">
    <div className="flex flex-col items-center gap-4">
      {/* Logo Optical Center Principal */}
      <img 
        src="https://www.optical-center.fr/img/logo-optical-center.svg" 
        alt="Optical Center" 
        className="h-12 md:h-16 w-auto"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="space-y-1">
        <h1 
          className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-black uppercase"
          style={BRAND_OUTLINE}
        >
          Optical Center
        </h1>
        <div className="flex items-center justify-center gap-2">
           <span className="h-px w-8 bg-slate-100"></span>
           <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-medium">Expertise Verrière</p>
           <span className="h-px w-8 bg-slate-100"></span>
        </div>
      </div>
    </div>
  </div>
);

const Reassurance: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6 animate-fadeIn">
    <p className="text-slate-600 text-sm leading-relaxed italic flex gap-3">
      <span className="text-black">✨</span> {text}
    </p>
  </div>
);

const InputField: React.FC<{ 
  label: string; 
  value: string | number; 
  onChange: (val: string) => void; 
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-black/20 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300"
    />
  </div>
);

export default function App() {
  const [state, setState] = useState<'home' | 'info' | 'quiz' | 'loading' | 'results'>('home');
  const [userInfo, setUserInfo] = useState<UserInfo>({ lastName: '', firstName: '', age: '' });
  const [currentId, setCurrentId] = useState<string>('work_main');
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    if (state === 'results') {
      document.title = `Rapport_OpticalCenter_${userInfo.firstName}_${userInfo.lastName}`;
    } else {
      document.title = 'Optical Center - Expert Verrier';
    }
  }, [state, userInfo]);

  const currentQuestion = QUESTIONNAIRE_TREE[currentId];

  const handleStartQuiz = () => {
    if (userInfo.lastName && userInfo.firstName && userInfo.age !== '') {
      setState('quiz');
    }
  };

  const handleAnswer = useCallback(async (optionId: string) => {
    const option = currentQuestion.options.find(o => o.id === optionId);
    if (!option) return;

    const newResponse: UserResponse = {
      questionId: currentId,
      questionText: currentQuestion.text,
      answerLabel: option.label,
      isStar: option.isStar
    };

    const nextResponses = [...responses, newResponse];
    setResponses(nextResponses);

    if (option.nextQuestionId) {
      setCurrentId(option.nextQuestionId);
    } else {
      finishQuiz(nextResponses);
    }
  }, [currentId, currentQuestion, responses]);

  const toggleMultiSelect = (optionId: string) => {
    setMultiSelection(prev => 
      prev.includes(optionId) ? prev.filter(i => i !== optionId) : [...prev, optionId]
    );
  };

  const finishQuiz = async (finalResponses: UserResponse[]) => {
    setState('loading');
    const rec = await generateRecommendation(finalResponses);
    setRecommendation(rec);
    setState('results');
  };

  const handleReset = () => {
    setState('home');
    setCurrentId('work_main');
    setUserInfo({ lastName: '', firstName: '', age: '' });
    setResponses([]);
    setMultiSelection([]);
    setRecommendation(null);
  };

  const progress = useMemo(() => {
    return Math.min(((responses.length + 1) / 12) * 100, 100);
  }, [responses]);

  const isFormValid = userInfo.lastName.trim() !== '' && userInfo.firstName.trim() !== '' && userInfo.age !== '';

  return (
    <Layout>
      {state === 'home' && (
        <div className="p-12 text-center space-y-10 animate-fadeIn">
          <Header />
          <p className="text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
            Une expérience visuelle sur-mesure pour définir les verres qui vous ressemblent, par les experts Optical Center.
          </p>
          <button 
            onClick={() => setState('info')}
            className="px-12 py-4 bg-black text-white rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Commencer le test
          </button>
        </div>
      )}

      {state === 'info' && (
        <div className="p-12 space-y-10 animate-fadeIn text-center">
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Identification</h3>
            <h2 className="text-3xl font-light text-slate-900 leading-tight">Parlons de vous</h2>
          </div>
          
          <div className="space-y-6 max-w-sm mx-auto">
            <InputField 
              label="Nom" 
              value={userInfo.lastName} 
              onChange={(v) => setUserInfo({...userInfo, lastName: v})} 
              placeholder="Votre nom"
            />
            <InputField 
              label="Prénom" 
              value={userInfo.firstName} 
              onChange={(v) => setUserInfo({...userInfo, firstName: v})} 
              placeholder="Votre prénom"
            />
            <InputField 
              label="Âge" 
              type="number"
              value={userInfo.age} 
              onChange={(v) => setUserInfo({...userInfo, age: v === '' ? '' : parseInt(v)})} 
              placeholder="Votre âge"
            />
          </div>

          <div className="pt-6">
            <button 
              disabled={!isFormValid}
              onClick={handleStartQuiz}
              className="px-12 py-4 bg-black text-white rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-20 disabled:scale-100"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {state === 'quiz' && (
        <div className="p-8 md:p-12 space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-black font-bold">
                {currentQuestion.category || 'Consultation'}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                {userInfo.firstName} {userInfo.lastName}
              </span>
            </div>
            <h2 className="text-3xl font-light text-slate-900 leading-tight">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => currentQuestion.isMultiSelect ? toggleMultiSelect(opt.id) : handleAnswer(opt.id)}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                  multiSelection.includes(opt.id) 
                  ? 'border-black bg-black text-white' 
                  : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`text-sm ${multiSelection.includes(opt.id) ? 'text-white' : 'text-slate-600'}`}>
                  {opt.label}
                </span>
                {!currentQuestion.isMultiSelect && (
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {currentQuestion.isMultiSelect && (
            <button 
              disabled={multiSelection.length === 0}
              onClick={() => {
                handleAnswer(multiSelection[0]); 
              }}
              className="w-full py-4 bg-black text-white rounded-2xl disabled:opacity-30 transition-opacity"
            >
              Continuer
            </button>
          )}

          {currentQuestion.reassurance && <Reassurance text={currentQuestion.reassurance} />}

          <div className="pt-8">
            <div className="h-0.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-black transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="p-20 text-center space-y-6">
          <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-light text-sm tracking-widest uppercase">Analyse Optical Center</p>
        </div>
      )}

      {state === 'results' && recommendation && (
        <div className="p-8 md:p-12 space-y-12 animate-fadeIn print:p-0">
          <div className="space-y-4 print:hidden">
            <h3 
              className="text-[10px] uppercase tracking-widest text-black font-bold"
              style={BRAND_OUTLINE}
            >
              Votre Profil Optical Center
            </h3>
            <h2 className="text-4xl font-light text-slate-900 leading-[1.1]">
              {userInfo.firstName}, {recommendation.title}
            </h2>
          </div>

          <div className="grid gap-4 print:hidden">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Solutions préconisées</h4>
            <div className="grid gap-2">
              {recommendation.keyFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <span className="text-sm text-slate-700 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 space-y-6 print:pt-0 print:border-none">
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-8 print:bg-white print:border-none print:p-0">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  <img src="https://www.optical-center.fr/img/logo-optical-center.svg" alt="Optical Center" className="h-6 w-auto" />
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Compte-rendu détaillé</h4>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">{userInfo.lastName} {userInfo.firstName.charAt(0)}.</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-tighter">{userInfo.age} ans</span>
                </div>
              </div>

              <div className="space-y-8">
                {responses.map((r, i) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] text-slate-300 font-mono mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                      <div className="space-y-2">
                        <h5 className="text-[13px] text-slate-400 font-medium leading-relaxed">
                          {r.questionText}
                        </h5>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {r.answerLabel}
                          </span>
                          {r.isStar && (
                            <span 
                              className="text-[9px] bg-slate-100 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 border border-red-500/20"
                              style={{ border: '0.5px solid #E30613' }}
                            >
                              Point clé ⭐
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 print:hidden">
              <button 
                onClick={() => window.print()} 
                className="w-full py-4 bg-black text-white rounded-2xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Générer le PDF pour l'opticien
              </button>
              <button 
                onClick={handleReset}
                className="w-full py-3 text-slate-400 text-[10px] uppercase tracking-[0.3em] hover:text-black transition-colors font-bold"
              >
                recommencer le questionnaire
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media print {
          body { background: white !important; }
          .min-h-screen { padding: 0 !important; background: white !important; display: block !important; }
          .w-full.max-w-3xl { max-width: 100% !important; border: none !important; box-shadow: none !important; padding: 20px !important; }
          button, footer, .print\\:hidden { display: none !important; }
          .rounded-[40px] { border-radius: 0 !important; }
          .bg-slate-50 { background-color: white !important; }
          .border-slate-100 { border-color: transparent !important; }
          .pt-10 { padding-top: 0 !important; }
          img { max-height: 50px !important; margin-bottom: 20px !important; }
        }
      `}</style>
    </Layout>
  );
}
