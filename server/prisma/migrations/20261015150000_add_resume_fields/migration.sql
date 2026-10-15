-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "resumePath" TEXT;

-- AlterTable
ALTER TABLE "internship_applications" ADD COLUMN IF NOT EXISTS "resumeName" TEXT;
ALTER TABLE "internship_applications" ADD COLUMN IF NOT EXISTS "resumePath" TEXT;
