export type CandidateStatus = string;
export type CandidateStatusOption = {
  id: string;
  name: string;
};
export type WorkAvailability = 'Presencial' | 'Híbrido' | 'Remoto';
export type SeniorityLevel = string;

export type Seniority = {
  id: string;
  name: string;
};

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
  technologies: string[];
  availability: WorkAvailability;
  seniority: SeniorityLevel;
  cvFile?: string; // base64 representation or simple URL for mockup
  cvFileName?: string;
  createdAt: string;

  // Additional Information
  salaryExpectationPJ?: string;
  salaryExpectationCLT?: string;
  availableFrom?: string;
  interviewDate?: string;
  interviewer1?: string;
  interviewer2?: string;
  interviewer3?: string;

  // Professional
  experienceIT?: string;
  experienceRole?: string;
  cvText?: string; // Text extracted from CV for searching

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

export type UserRole = 'admin' | 'hr' | 'interviewer';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role: UserRole;
  password?: string;
  active: boolean;
};
