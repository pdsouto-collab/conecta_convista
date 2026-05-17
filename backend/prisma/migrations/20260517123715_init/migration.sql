-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedin" TEXT,
    "technologies" TEXT[],
    "availability" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "cvFileName" TEXT,
    "cvText" TEXT,
    "createdAt" TEXT NOT NULL,
    "candidateSource" TEXT,
    "workBase" TEXT,
    "language" TEXT,
    "languageProficiency" TEXT,
    "language2" TEXT,
    "languageProficiency2" TEXT,
    "language3" TEXT,
    "languageProficiency3" TEXT,
    "language4" TEXT,
    "languageProficiency4" TEXT,
    "birthDate" TEXT,
    "salaryExpectationPJ" TEXT,
    "salaryExpectationCLT" TEXT,
    "availableFrom" TEXT,
    "interviewDate" TEXT,
    "interviewer1" TEXT,
    "interviewer2" TEXT,
    "interviewer3" TEXT,
    "role" TEXT,
    "experienceIT" TEXT,
    "experienceRole" TEXT,
    "isExConvista" BOOLEAN DEFAULT false,
    "mainProjects" TEXT,
    "lastContactDate" TEXT,
    "hasRestriction" BOOLEAN DEFAULT false,
    "restrictionDetails" TEXT,
    "generalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Novo',

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationMatrix" (
    "id" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "observation" TEXT,
    "type" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "EvaluationMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT,
    "role" TEXT NOT NULL DEFAULT 'interviewer',
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seniority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Seniority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoleOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateStatusOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CandidateStatusOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Seniority_name_key" ON "Seniority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleOption_name_key" ON "RoleOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateStatusOption_name_key" ON "CandidateStatusOption"("name");

-- AddForeignKey
ALTER TABLE "EvaluationMatrix" ADD CONSTRAINT "EvaluationMatrix_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
