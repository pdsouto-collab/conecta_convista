-- CreateTable
CREATE TABLE "LibraryCriteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "technologyId" TEXT,

    CONSTRAINT "LibraryCriteria_pkey" PRIMARY KEY ("id")
);
