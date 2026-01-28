
import { Question } from './types';

export const QUESTIONNAIRE_TREE: Record<string, Question> = {
  'work_main': {
    id: 'work_main',
    text: 'Vous travaillez surtout...',
    category: 'travail',
    options: [
      { id: 'work_screen', label: '💻 Derrière un écran (ordi, téléphone, lecture)', nextQuestionId: 'sub_work_screen' },
      { id: 'work_outdoor', label: '👷 À l’extérieur (chantier, conduite, sport)', nextQuestionId: 'sub_work_outdoor' },
      { id: 'work_mixed', label: '🚶 Entre plusieurs situations (réunions, clients, déplacements)', nextQuestionId: 'sub_work_mixed' }
    ]
  },
  'sub_work_screen': {
    id: 'sub_work_screen',
    text: 'Précisez votre usage écran :',
    options: [
      { id: 'sws_1', label: '🖥️ Toute la journée sur ordinateur', nextQuestionId: 'symptoms_q1' },
      { id: 'sws_2', label: '📱 Ordinateur + téléphone/tablette (poly-écrans)', nextQuestionId: 'symptoms_q1' },
      { id: 'sws_3', label: '📚 Lecture / écriture prolongée', nextQuestionId: 'symptoms_q1' }
    ]
  },
  'sub_work_outdoor': {
    id: 'sub_work_outdoor',
    text: 'Précisez votre activité extérieure :',
    options: [
      { id: 'swo_1', label: '🏗️ Chantier / atelier manuel', nextQuestionId: 'symptoms_q1' },
      { id: 'swo_2', label: '🚗 Conduite de jour', nextQuestionId: 'symptoms_q1' },
      { id: 'swo_3', label: '🌙 Conduite de nuit', nextQuestionId: 'symptoms_q1' },
      { id: 'swo_4', label: '☀️ Plein air / sport', nextQuestionId: 'symptoms_q1' }
    ]
  },
  'sub_work_mixed': {
    id: 'sub_work_mixed',
    text: 'Précisez votre mobilité :',
    options: [
      { id: 'swm_1', label: '🏥 Changements fréquents de distance', nextQuestionId: 'symptoms_q1' },
      { id: 'swm_2', label: '🤝 Déplacements / rendez-vous clients', nextQuestionId: 'symptoms_q1' },
      { id: 'swm_3', label: '🛍️ Alternance clients / caisse / rayons', nextQuestionId: 'symptoms_q1' }
    ]
  },
  'symptoms_q1': {
    id: 'symptoms_q1',
    text: 'Est-ce qu’il vous arrive d’avoir une gêne visuelle ?',
    category: 'symptomes',
    options: [
      { id: 'symp_no', label: '❌ Non jamais', nextQuestionId: 'symptoms_relance' },
      { id: 'symp_fatigue', label: '😫 Oui, fatigue des yeux', nextQuestionId: 'sub_symp_fatigue', isStar: true },
      { id: 'symp_headache', label: '🤕 Oui, maux de tête', nextQuestionId: 'sub_symp_headache', isStar: true },
      { id: 'symp_dry', label: '🌵 Oui, sécheresse / picotements', nextQuestionId: 'sub_symp_dry', isStar: true }
    ]
  },
  'symptoms_relance': {
    id: 'symptoms_relance',
    text: 'D’accord, et donc même après une longue journée ou devant les phares la nuit ?',
    options: [
      { id: 'rel_no', label: '❌ Non jamais', nextQuestionId: 'lenses_q1' },
      { id: 'rel_yes', label: '✅ Oui, ça m’arrive finalement', nextQuestionId: 'symptoms_q1' }
    ]
  },
  'sub_symp_fatigue': {
    id: 'sub_symp_fatigue',
    text: 'Quand ressentez-vous cette fatigue ?',
    options: [
      { id: 'sf_1', label: '📖 Quand je lis ou écris longtemps', nextQuestionId: 'lenses_q1' },
      { id: 'sf_2', label: '💻 Après plusieurs heures sur écran', nextQuestionId: 'lenses_q1' },
      { id: 'sf_3', label: '🚗 Quand je conduis longtemps (soir)', nextQuestionId: 'lenses_q1' }
    ]
  },
  'sub_symp_headache': {
    id: 'sub_symp_headache',
    text: 'À quel moment surviennent les maux de tête ?',
    options: [
      { id: 'sh_1', label: '🏠 En fin de journée de travail', nextQuestionId: 'lenses_q1' },
      { id: 'sh_2', label: '📚 Concentration longue sur texte/écran', nextQuestionId: 'lenses_q1' },
      { id: 'sh_3', label: '🌙 À cause des phares ou lumières la nuit', nextQuestionId: 'lenses_q1' }
    ]
  },
  'sub_symp_dry': {
    id: 'sub_symp_dry',
    text: 'Quand ressentez-vous cette sécheresse ?',
    options: [
      { id: 'sd_1', label: '🖥️ Longtemps devant les écrans', nextQuestionId: 'lenses_q1' },
      { id: 'sd_2', label: '🌬️ Dehors (vent, pollution, air sec)', nextQuestionId: 'lenses_q1' },
      { id: 'sd_3', label: '👓 Quand je porte mes lentilles longtemps', nextQuestionId: 'lenses_q1' }
    ]
  },
  'lenses_q1': {
    id: 'lenses_q1',
    text: 'Portez-vous des lentilles de contact ?',
    category: 'lentilles',
    options: [
      { id: 'len_yes', label: '✅ Oui', nextQuestionId: 'lenses_freq' },
      { id: 'len_no', label: '❌ Non', nextQuestionId: 'lenses_relance' }
    ]
  },
  'lenses_relance': {
    id: 'lenses_relance',
    text: 'Et c’est parce que...',
    reassurance: 'C’est très courant ! Aujourd’hui, il existe des lentilles très simples et confortables. Elles sont idéales pour le sport ou les vacances.',
    options: [
      { id: 'lr_1', label: '🙈 J’ai un peu peur de la pose', nextQuestionId: 'glasses_start' },
      { id: 'lr_2', label: '🌵 Peur que ça me gêne (sécheresse)', nextQuestionId: 'glasses_start' },
      { id: 'lr_3', label: '🤔 Je n’y ai jamais pensé', nextQuestionId: 'glasses_start' },
      { id: 'lr_4', label: '🚫 Je n’en ai pas besoin', nextQuestionId: 'glasses_start' }
    ]
  },
  'lenses_freq': {
    id: 'lenses_freq',
    text: 'Vous les portez plutôt...',
    options: [
      { id: 'lf_1', label: '🗓️ 1 à 2 fois par semaine', nextQuestionId: 'lenses_why_freq' },
      { id: 'lf_2', label: '📅 Tous les jours (Mensuel/Bi-mensuel)', nextQuestionId: 'lenses_interest_daily' }
    ]
  },
  'lenses_why_freq': {
    id: 'lenses_why_freq',
    text: 'Pourquoi cette fréquence ?',
    options: [
      { id: 'lwf_1', label: 'Cette utilisation me suffit', nextQuestionId: 'glasses_start' },
      { id: 'lwf_2', label: 'On ne m’a jamais parlé d’autre chose', nextQuestionId: 'glasses_start' }
    ]
  },
  'lenses_interest_daily': {
    id: 'lenses_interest_daily',
    text: 'Seriez-vous intéressé par des journalières pour certaines occasions (sport, plage, voyage) ?',
    options: [
      { id: 'lid_yes', label: '✅ Oui', nextQuestionId: 'glasses_start' },
      { id: 'lid_no', label: '❌ Non', nextQuestionId: 'glasses_start' }
    ]
  },
  'glasses_start': {
    id: 'glasses_start',
    text: 'Parlons de vos futures lunettes : Portez-vous actuellement des lunettes ?',
    options: [
      { id: 'gs_yes', label: '✅ Oui', nextQuestionId: 'needs_selection' },
      { id: 'gs_no', label: '❌ Non', nextQuestionId: 'glasses_no_relance' }
    ]
  },
  'glasses_no_relance': {
    id: 'glasses_no_relance',
    text: 'Et c’est parce que...',
    reassurance: 'Pas de souci, aujourd’hui il existe des lunettes très légères, discrètes et adaptées à tous les styles.',
    options: [
      { id: 'gnr_1', label: 'Je n’en ai jamais eu besoin', nextQuestionId: 'needs_selection' },
      { id: 'gnr_2', label: 'Je ne me sens pas concerné', nextQuestionId: 'needs_selection' },
      { id: 'gnr_3', label: 'Je n’aime pas trop l’idée (confort, look)', nextQuestionId: 'needs_selection' }
    ]
  },
  'needs_selection': {
    id: 'needs_selection',
    text: 'Votre besoin est plutôt de...',
    isMultiSelect: true,
    category: 'besoins',
    options: [
      { id: 'need_read', label: '📖 Lire ou travailler de près', nextQuestionId: 'branch_distance' },
      { id: 'need_screen', label: '🖥️ Être à l’aise sur écrans', nextQuestionId: 'blue_light_q1' },
      { id: 'need_drive', label: '🚗 Conduire (jour/nuit)', nextQuestionId: 'branch_distance' },
      { id: 'need_outdoor', label: '☀️ Être protégé à l’extérieur', nextQuestionId: 'branch_distance' },
      { id: 'need_daily', label: '👔 Un usage quotidien polyvalent', nextQuestionId: 'branch_distance' },
      { id: 'need_unsure', label: '❓ Je ne sais pas', nextQuestionId: 'needs_safety_net' }
    ]
  },
  'needs_safety_net': {
    id: 'needs_safety_net',
    text: 'Quelle situation vous arrive le plus souvent ?',
    options: [
      { id: 'sn_1', label: 'Lire / Voir de près', nextQuestionId: 'branch_distance' },
      { id: 'sn_2', label: 'Voir de loin', nextQuestionId: 'branch_distance' },
      { id: 'sn_3', label: 'Enchaîner les deux', nextQuestionId: 'branch_distance' }
    ]
  },
  'blue_light_q1': {
    id: 'blue_light_q1',
    text: 'Souhaitez-vous limiter la fatigue sur écran (lumière bleue) ?',
    options: [
      { id: 'bl_yes', label: '✅ Oui', nextQuestionId: 'blue_light_fidelity' },
      { id: 'bl_no', label: '❌ Non', nextQuestionId: 'branch_distance' }
    ]
  },
  'blue_light_fidelity': {
    id: 'blue_light_fidelity',
    text: 'Est-ce important que les couleurs restent parfaitement fidèles (ex: graphisme) ?',
    options: [
      { id: 'blf_yes', label: '🌈 Oui (Traitement Haute Fidélité)', nextQuestionId: 'branch_distance' },
      { id: 'blf_no', label: '👓 Non (Confort standard)', nextQuestionId: 'branch_distance' }
    ]
  },
  'branch_distance': {
    id: 'branch_distance',
    text: 'Dans votre quotidien, votre besoin est surtout de...',
    options: [
      { id: 'dist_near', label: '📖 Voir net de près', nextQuestionId: 'final_step' },
      { id: 'dist_far', label: '🌍 Voir net de loin', nextQuestionId: 'final_step' },
      { id: 'dist_all', label: '🔄 Toutes les distances', nextQuestionId: 'final_step' }
    ]
  },
  'final_step': {
    id: 'final_step',
    text: 'Dernier point : ressentez-vous une gêne en conduite nocturne ?',
    options: [
      { id: 'night_yes', label: '🚗 Oui', isStar: true },
      { id: 'night_no', label: '🚗 Non' }
    ]
  }
};
