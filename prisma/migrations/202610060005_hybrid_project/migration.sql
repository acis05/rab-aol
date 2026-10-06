-- Allow projects to be created locally before Accurate Online is connected.
ALTER TABLE "Project" ALTER COLUMN "accurateId" DROP NOT NULL;
