export type CandidateStatus = 'Novo' | 'Em Andamento' | 'Aprovado' | 'Reprovado';
export type WorkAvailability = 'Presencial' | 'Híbrido' | 'Remoto';
export type SeniorityLevel = 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';

export type EvaluationMatrix = {
  id: string;
  criteria: string;
  score: number; // 1 to 5
  observation: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  sapModules: string[];
  availability: WorkAvailability;
  seniority: SeniorityLevel;
  cvFile?: string; // base64 representation or simple URL for mockup
  cvFileName?: string;
  createdAt: string;

  // Evaluation
  behavioralEvaluation: EvaluationMatrix[];
  technicalEvaluation: EvaluationMatrix[];
  generalNotes: string;
  status: CandidateStatus;
};

export type Technology = {
  id: string;
  name: string;
};

export type LibraryCriteriaType = 'Comportamental' | 'Técnico';

export type LibraryCriteria = {
  id: string;
  name: string;
  type: LibraryCriteriaType;
  technologyId?: string; // only for Técnico, optional
};
