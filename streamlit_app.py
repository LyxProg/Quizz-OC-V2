
import streamlit as st
import google.generativeai as genai
import os
import json

# --- CONFIGURATION ET STYLE ---
st.set_page_config(page_title="Optical Center - Expert Verrier", layout="centered")

def inject_custom_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: #F5F5F7 !important;
    }

    .main {
        background-color: #F5F5F7;
    }

    /* Carte principale */
    .stApp .main .block-container {
        background-color: white;
        padding: 3rem;
        border-radius: 40px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        margin-top: 2rem;
        margin-bottom: 2rem;
        border: 1px solid rgba(255,255,255,0.2);
    }

    /* Header Brand */
    .brand-title {
        text-align: center;
        text-transform: uppercase;
        font-weight: 800;
        font-size: 2rem;
        letter-spacing: 0.2em;
        color: black;
        -webkit-text-stroke: 0.5px #E30613;
        margin-bottom: 0;
    }
    
    .brand-subtitle {
        text-align: center;
        text-transform: uppercase;
        font-size: 0.6rem;
        letter-spacing: 0.4em;
        color: #94a3b8;
        margin-bottom: 2rem;
    }

    /* Boutons personnalisés */
    div.stButton > button {
        width: 100%;
        border-radius: 15px;
        border: 1px solid #f1f5f9;
        background-color: white;
        color: #1e293b;
        padding: 1rem;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: left;
        font-size: 0.9rem;
    }

    div.stButton > button:hover {
        border-color: black;
        background-color: #fafafa;
        transform: translateY(-2px);
    }

    .primary-btn div > button {
        background-color: black !important;
        color: white !important;
        text-align: center !important;
        border-radius: 50px !important;
        border: none !important;
        font-weight: 500;
    }

    /* Progress bar */
    .stProgress > div > div > div > div {
        background-color: black;
    }

    /* Footer */
    .footer {
        text-align: center;
        color: #94a3b8;
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        margin-top: 3rem;
        padding-bottom: 2rem;
    }
    
    /* Reassurance message */
    .reassurance {
        background-color: #f8fafc;
        padding: 1.5rem;
        border-radius: 1rem;
        border: 1px solid #f1f5f9;
        font-style: italic;
        color: #475569;
        font-size: 0.85rem;
        margin-top: 1.5rem;
    }

    /* Rapport final */
    .report-card {
        background-color: #f8fafc;
        padding: 2rem;
        border-radius: 32px;
        border: 1px solid #f1f5f9;
        margin-top: 2rem;
    }
    
    .point-cle {
        background-color: #f1f5f9;
        color: black;
        padding: 2px 8px;
        border-radius: 99px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        border: 0.5px solid #E30613;
        margin-left: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- DONNÉES DU QUESTIONNAIRE ---
TREE = {
    'work_main': {
        'text': 'Vous travaillez surtout...',
        'category': 'TRAVAIL',
        'options': [
            {'id': 'work_screen', 'label': '💻 Derrière un écran', 'next': 'sub_work_screen'},
            {'id': 'work_outdoor', 'label': '👷 À l’extérieur', 'next': 'sub_work_outdoor'},
            {'id': 'work_mixed', 'label': '🚶 Entre plusieurs situations', 'next': 'sub_work_mixed'}
        ]
    },
    'sub_work_screen': {
        'text': 'Précisez votre usage écran :',
        'options': [
            {'id': 'sws_1', 'label': '🖥️ Toute la journée sur ordinateur', 'next': 'symptoms_q1'},
            {'id': 'sws_2', 'label': '📱 Poly-écrans (Tél + Tablette)', 'next': 'symptoms_q1'},
            {'id': 'sws_3', 'label': '📚 Lecture / écriture prolongée', 'next': 'symptoms_q1'}
        ]
    },
    'sub_work_outdoor': {
        'text': 'Précisez votre activité extérieure :',
        'options': [
            {'id': 'swo_1', 'label': '🏗️ Chantier / Atelier', 'next': 'symptoms_q1'},
            {'id': 'swo_2', 'label': '🚗 Conduite de jour', 'next': 'symptoms_q1'},
            {'id': 'swo_3', 'label': '🌙 Conduite de nuit', 'next': 'symptoms_q1'}
        ]
    },
    'sub_work_mixed': {
        'text': 'Précisez votre mobilité :',
        'options': [
            {'id': 'swm_1', 'label': '🏥 Changements fréquents de distance', 'next': 'symptoms_q1'},
            {'id': 'swm_2', 'label': '🤝 Rendez-vous clients', 'next': 'symptoms_q1'}
        ]
    },
    'symptoms_q1': {
        'text': 'Éprouvez-vous une gêne visuelle ?',
        'category': 'SYMPTÔMES',
        'options': [
            {'id': 'symp_no', 'label': '❌ Non jamais', 'next': 'lenses_q1'},
            {'id': 'symp_fatigue', 'label': '😫 Oui, fatigue des yeux', 'next': 'lenses_q1', 'star': True},
            {'id': 'symp_headache', 'label': '🤕 Oui, maux de tête', 'next': 'lenses_q1', 'star': True}
        ]
    },
    'lenses_q1': {
        'text': 'Portez-vous des lentilles ?',
        'category': 'LENTILLES',
        'options': [
            {'id': 'len_yes', 'label': '✅ Oui', 'next': 'final_step'},
            {'id': 'len_no', 'label': '❌ Non', 'next': 'final_step'}
        ]
    },
    'final_step': {
        'text': 'Dernier point : ressentez-vous une gêne en conduite nocturne ?',
        'options': [
            {'id': 'night_yes', 'label': '🚗 Oui', 'next': None, 'star': True},
            {'id': 'night_no', 'label': '🚗 Non', 'next': None}
        ]
    }
}

# --- LOGIQUE IA ---
def get_recommendation(responses):
    # Initialisation de l'IA avec la clé API de l'environnement
    genai.configure(api_key=os.environ.get("API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash') # Utilisation du modèle flash pour la rapidité
    
    prompt = f"""
    En tant qu'expert opticien chez Optical Center, analyse ces réponses pour recommander des verres.
    Réponses : {json.dumps(responses, ensure_ascii=False)}
    Réponds EXCLUSIVEMENT en JSON avec cette structure : 
    {{"title": "Titre Pro", "explanation": "Texte pédagogique", "keyFeatures": ["F1", "F2", "F3"]}}
    """
    
    try:
        response = model.generate_content(prompt)
        # Nettoyage de la réponse si l'IA ajoute des blocs de code markdown
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        return {
            "title": "Solution Vision Confort",
            "explanation": "Basé sur votre profil, nous recommandons une solution polyvalente pour protéger votre capital vue.",
            "keyFeatures": ["Traitement anti-fatigue", "Filtre lumière bleue", "Géométrie optimisée"]
        }

# --- APPLICATION PRINCIPALE ---
def main():
    inject_custom_css()
    
    # Initialisation du state
    if 'step' not in st.session_state:
        st.session_state.step = 'home'
    if 'responses' not in st.session_state:
        st.session_state.responses = []
    if 'current_q' not in st.session_state:
        st.session_state.current_q = 'work_main'
    if 'user' not in st.session_state:
        st.session_state.user = {}

    # HEADER BRANDING
    st.image("https://www.optical-center.fr/img/logo-optical-center.svg", width=140)
    st.markdown('<h1 class="brand-title">Optical Center</h1>', unsafe_allow_html=True)
    st.markdown('<p class="brand-subtitle">Expertise Verrière</p>', unsafe_allow_html=True)

    # ÉTAPE : ACCUEIL
    if st.session_state.step == 'home':
        st.markdown("<p style='text-align:center; color:#64748b; font-weight:300;'>Une expérience visuelle sur-mesure pour définir les verres qui vous ressemblent.</p>", unsafe_allow_html=True)
        st.markdown('<div class="primary-btn">', unsafe_allow_html=True)
        if st.button("Commencer le test", use_container_width=True):
            st.session_state.step = 'info'
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    # ÉTAPE : IDENTIFICATION
    elif st.session_state.step == 'info':
        st.markdown("<p style='text-transform:uppercase; font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:2px; text-align:center;'>Identification</p>", unsafe_allow_html=True)
        st.markdown("<h2 style='text-align:center; font-weight:300; margin-bottom:2rem;'>Parlons de vous</h2>", unsafe_allow_html=True)
        
        nom = st.text_input("Nom", placeholder="Votre nom")
        prenom = st.text_input("Prénom", placeholder="Votre prénom")
        age = st.number_input("Âge", min_value=1, max_value=120, value=30)
        
        st.markdown('<div class="primary-btn" style="margin-top:2rem;">', unsafe_allow_html=True)
        if st.button("Suivant"):
            if nom and prenom:
                st.session_state.user = {"nom": nom, "prenom": prenom, "age": age}
                st.session_state.step = 'quiz'
                st.rerun()
            else:
                st.error("Veuillez renseigner votre identité.")
        st.markdown('</div>', unsafe_allow_html=True)

    # ÉTAPE : QUIZ
    elif st.session_state.step == 'quiz':
        q_id = st.session_state.current_q
        q_data = TREE[q_id]
        
        # Header question
        col1, col2 = st.columns([1,1])
        with col1:
            cat = q_data.get('category', 'Consultation')
            st.markdown(f"<span style='font-size:10px; font-weight:700; color:black; letter-spacing:2px;'>{cat}</span>", unsafe_allow_html=True)
        with col2:
            st.markdown(f"<div style='text-align:right; font-size:10px; color:#cbd5e1;'>{st.session_state.user['prenom']} {st.session_state.user['nom']}</div>", unsafe_allow_html=True)
        
        st.markdown(f"<h2 style='font-weight:300; margin-top:1rem; margin-bottom:2rem;'>{q_data['text']}</h2>", unsafe_allow_html=True)
        
        # Options
        for opt in q_data['options']:
            if st.button(opt['label'], key=opt['id']):
                # Sauvegarde réponse
                st.session_state.responses.append({
                    "question": q_data['text'],
                    "answer": opt['label'],
                    "star": opt.get('star', False)
                })
                
                # Navigation
                if opt['next']:
                    st.session_state.current_q = opt['next']
                    st.rerun()
                else:
                    st.session_state.step = 'loading'
                    st.rerun()
        
        # Barre de progression fictive
        progress = min((len(st.session_state.responses) + 1) / 7, 1.0)
        st.progress(progress)

    # ÉTAPE : CHARGEMENT / ANALYSE
    elif st.session_state.step == 'loading':
        st.markdown("<div style='text-align:center; padding:3rem;'>", unsafe_allow_html=True)
        with st.spinner("Analyse Optical Center en cours..."):
            recommendation = get_recommendation(st.session_state.responses)
            st.session_state.recommendation = recommendation
            st.session_state.step = 'results'
            st.rerun()

    # ÉTAPE : RÉSULTATS
    elif st.session_state.step == 'results':
        rec = st.session_state.recommendation
        user = st.session_state.user
        
        st.markdown(f"<p style='font-size:10px; font-weight:700; color:black; letter-spacing:2px; text-transform:uppercase;'>Votre Profil Optical Center</p>", unsafe_allow_html=True)
        st.markdown(f"<h2 style='font-weight:300; font-size:2.5rem; line-height:1.1;'>{user['prenom']},<br/>{rec['title']}</h2>", unsafe_allow_html=True)
        
        st.write(rec['explanation'])
        
        st.markdown("### Solutions préconisées")
        for feature in rec['keyFeatures']:
            st.markdown(f"""
            <div style='display:flex; align-items:center; gap:15px; padding:1rem; background:white; border-radius:15px; border:1px solid #f1f5f9; margin-bottom:10px; box-shadow:0 2px 4px rgba(0,0,0,0.02);'>
                <div style='width:6px; height:6px; background:black; border-radius:50%;'></div>
                <span style='font-size:0.9rem; color:#334155; font-weight:500;'>{feature}</span>
            </div>
            """, unsafe_allow_html=True)
            
        # Rapport détaillé
        st.markdown('<div class="report-card">', unsafe_allow_html=True)
        col_a, col_b = st.columns([1,1])
        with col_a:
            st.image("https://www.optical-center.fr/img/logo-optical-center.svg", width=100)
            st.markdown("<p style='font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:1px; text-transform:uppercase;'>Compte-rendu détaillé</p>", unsafe_allow_html=True)
        with col_b:
            st.markdown(f"<div style='text-align:right;'><span style='font-weight:700;'>{user['nom']} {user['prenom'][0]}.</span><br/><span style='font-size:10px; color:#94a3b8;'>{user['age']} ans</span></div>", unsafe_allow_html=True)
        
        st.markdown("<hr style='border:0.5px solid #e2e8f0; margin:1.5rem 0;'>", unsafe_allow_html=True)
        
        for i, r in enumerate(st.session_state.responses):
            star_html = '<span class="point-cle">Point clé ⭐</span>' if r['star'] else ""
            st.markdown(f"""
            <div style='margin-bottom:1.5rem;'>
                <p style='font-size:12px; color:#94a3b8; margin-bottom:2px;'>{r['question']}</p>
                <p style='font-weight:600; color:#1e293b;'>{r['answer']} {star_html}</p>
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        if st.button("Recommencer le questionnaire", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    # FOOTER
    st.markdown('<div class="footer">Précision • Confort • Style<br/><br/><span style="opacity:0.4; font-weight:bold; letter-spacing:0.5em;">Optical Center</span></div>', unsafe_allow_html=True)

if __name__ == "__main__":
    main()
