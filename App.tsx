import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { QUESTIONNAIRE_TREE } from './constants';
import { UserResponse, UserInfo } from './types';

const BRAND_OUTLINE = { 
  WebkitTextStroke: '0.5px #E30613',
  textStroke: '0.5px #E30613'
};

const Header: React.FC = () => (
  <div className="pt-10 pb-6 text-center print:pt-4">
    <div className="flex flex-col items-center gap-4">
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
  const [state, setState] = useState<'home' | 'info' | 'quiz' | 'results'>('home');
  const [userInfo, setUserInfo] = useState<UserInfo>({ lastName: '', firstName: '', age: '' });
  const [currentId, setCurrentId] = useState<string>('work_main');
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (state === 'results') {
      document.title = `Bilan_Vision_OC_${userInfo.lastName}`;
    } else {
      document.title = 'Optical Center - Bilan Visuel';
    }
  }, [state, userInfo]);

  const currentQuestion = QUESTIONNAIRE_TREE[currentId];

  const handleStartQuiz = () => {
    if (userInfo.lastName && userInfo.firstName && userInfo.age !== '') {
      setState('quiz');
    }
  };

  // FONCTION D'ENVOI À NETLIFY
  const sendToNetlify = (finalResponses: UserResponse[]) => {
    setIsSending(true);
    
    // ANALYSE MALINE POUR L'OPTICIEN
    let suggestion = "Profil standard.";
    const allAnswers = finalResponses.map(r => r.answerLabel.toLowerCase()).join(' ');
    
    if (allAnswers.includes('nuit') || allAnswers.includes('conduite')) {
      suggestion = "⭐ Suggestion : Forte gêne nocturne. Proposer traitement anti-éblouissement.";
    } else if (allAnswers.includes('écran') || allAnswers.includes('ordinateur')) {
      suggestion = "💻 Suggestion : Usage intensif écrans. Proposer filtre lumière bleue.";
    }

    const formData = new FormData();
    formData.append("form-name", "expertise-oc");
    formData.append("nom", userInfo.lastName);
    formData.append("prenom", userInfo.firstName);
    formData.append("age", userInfo.age.toString());
    formData.append("suggestion_ia", suggestion);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData as any).toString(),
    })
    .then(() => {
      console.log("Données envoyées au magasin.");
      setIsSending(false);
    })
    .catch((error) => {
      console.error("Erreur envoi:", error);
      setIsSending(false);
    });
  };

  const handleAnswer = useCallback((optionId: string) => {
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
      // On envoie les données juste avant de passer aux résultats
      sendToNetlify(nextResponses);
      setState('results');
    }
  }, [currentId, currentQuestion, responses, userInfo]);

  const toggleMultiSelect = (optionId: string) => {
    setMultiSelection(prev => 
      prev.includes(optionId) ? prev.filter(i => i !== optionId) : [...prev, optionId]
    );
  };

  const handleReset = () => {
    setState('home');
    setCurrentId('work_main');
    setUserInfo({ lastName: '', firstName: '', age: '' });
    setResponses([]);
    setMultiSelection([]);
  };

  const progress = useMemo(() => {
    return Math.min(((responses.length + 1) / 12) * 100, 100);
  }, [responses]);

  const isFormValid = userInfo.lastName.trim() !== '' && 
                      userInfo.firstName.trim() !== '' && 
                      userInfo.age !== '';

  return (
    <Layout>
      {state === 'home' && (
        <div className="p-12 text-center space-y-10 animate-fadeIn">
          <Header />
          <p className="text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
            Optimisez votre temps d'attente : définissez vos besoins visuels en 2 minutes pour faciliter votre échange avec votre opticien.
          </p>
          <button 
            onClick={() => setState('info')}
            className="px-12 py-4 bg-black text-white rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Commencer le bilan
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
                {currentQuestion.category || 'Analyse'}
              </span>
              <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                {userInfo.firstName}
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
                  : 'border-slate-100 hover:border-slate-300 bg-white shadow-sm'
                }`}
              >
                <span className={`text-sm ${multiSelection.includes(opt.id) ? 'text-white' : 'text-slate-600'}`}>
                  {opt.label}
                </span>
                {!currentQuestion.isMultiSelect && (
                  <svg className="w-4 h-4 text-slate-200 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                const opt = currentQuestion.options.find(o => o.id === multiSelection[0]);
                if (opt) handleAnswer(opt.id);
              }}
              className="w-full py-4 bg-black text-white rounded-2xl disabled:opacity-30 transition-opacity font-medium"
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

      {state === 'results' && (
        <div className="p-8 md:p-12 space-y-10 animate-fadeIn print:p-0">
          <div className="space-y-4 print:hidden">
            <h3 
              className="text-[10px] uppercase tracking-widest text-black font-bold"
              style={BRAND_OUTLINE}
            >
              Bilan Vision
            </h3>
            <h2 className="text-4xl font-light text-slate-900 leading-tight">
              Merci {userInfo.firstName}.<br/>Voici votre récapitulatif.
            </h2>
          </div>

          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-8 print:bg-white print:border-none print:p-0">
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <img src="https://www.optical-center.fr/img/logo-optical-center.svg" alt="Optical Center" className="h-6 w-auto" />
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Compte-rendu client</h4>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">{userInfo.lastName} {userInfo.firstName}</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-tighter">{userInfo.age} ans</span>
              </div>
            </div>

            <div className="space-y-6">
              {responses.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] text-slate-300 font-mono mt-1">{(i + 1).toString().padStart(2, '0')}</span>
                    <div className="flex-1 space-y-1">
                      <h5 className="text-[12px] text-slate-400 font-medium">
                        {r.questionText}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {r.answerLabel}
                        </span>
                        {r.isStar && (
                          <span 
                            className="text-[8px] bg-white text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-500/30"
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
            
            <div className="pt-6 border-t border-slate-200 text-center">
               <p className="text-[9px] uppercase tracking-[0.2em] text-slate-300 font-medium">
                 Document généré par l'outil d'expertise Optical Center
               </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 print:hidden">
            <button 
              onClick={() => window.print()} 
              className="w-full py-5 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Enregistrer en PDF / Imprimer
            </button>
            <button 
              onClick={handleReset}
              className="w-full py-3 text-slate-400 text-[10px] uppercase tracking-[0.3em] hover:text-black transition-colors font-bold"
            >
              recommencer le questionnaire
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media print {
          body { background: white !important; }
          .min-h-screen { padding: 0 !important; background: white !important; display: block !important; }
          .w-full.max-w-3xl { max-width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          button, footer, .print\\:hidden { display: none !important; }
          .rounded-[40px] { border-radius: 0 !important; }
          .bg-slate-50 { background-color: white !important; }
          .border-slate-100 { border-color: transparent !important; }
          .pt-10 { padding-top: 0 !important; }
          img { max-height: 40px !important; margin-bottom: 20px !important; }
          #root { display: block !important; }
          .Layout_root { padding: 0 !important; }
        }
      `}</style>
    </Layout>
  );
}