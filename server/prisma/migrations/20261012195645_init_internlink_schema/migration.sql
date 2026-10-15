-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'COMPANY', 'FACULTY', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('Remote', 'Hybrid', 'On_site');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('Draft', 'Open', 'In_Progress', 'Completed', 'Closed');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Applied', 'Under_Review', 'Shortlisted', 'Interview_Scheduled', 'Selected', 'Rejected', 'Withdrawn');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Late', 'Leave', 'Holiday');

-- CreateEnum
CREATE TYPE "WorkLogStatus" AS ENUM ('Draft', 'Submitted', 'Reviewed', 'Changes_Requested');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "college" TEXT NOT NULL DEFAULT 'VIT Chennai',
    "collegeId" TEXT NOT NULL,
    "course" TEXT NOT NULL DEFAULT 'B.Tech Computer Science',
    "year" TEXT NOT NULL DEFAULT '3rd Year',
    "department" TEXT NOT NULL DEFAULT 'Computer Science',
    "bio" TEXT,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "linkedin" TEXT,
    "github" TEXT,
    "resumeName" TEXT,
    "profileCompletion" INTEGER NOT NULL DEFAULT 70,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "industry" TEXT NOT NULL DEFAULT 'Software Development',
    "website" TEXT,
    "description" TEXT,
    "location" TEXT NOT NULL DEFAULT 'Bengaluru, Karnataka',
    "logoColor" TEXT NOT NULL DEFAULT 'bg-blue-600',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Computer Science',
    "college" TEXT NOT NULL DEFAULT 'VIT Chennai',
    "designation" TEXT NOT NULL DEFAULT 'Assistant Professor',
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_mentor_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "student_mentor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internships" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL DEFAULT '[]',
    "requiredSkills" TEXT NOT NULL DEFAULT '[]',
    "eligibility" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workMode" "WorkMode" NOT NULL DEFAULT 'Hybrid',
    "duration" TEXT NOT NULL DEFAULT '6 months',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "stipend" INTEGER NOT NULL DEFAULT 15000,
    "openings" INTEGER NOT NULL DEFAULT 2,
    "benefits" TEXT NOT NULL DEFAULT '[]',
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InternshipStatus" NOT NULL DEFAULT 'Open',
    "type" TEXT NOT NULL DEFAULT 'Software Development',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_applications" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Applied',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "interviewDate" TIMESTAMP(3),
    "interviewTime" TEXT,
    "interviewLink" TEXT,
    "interviewNotes" TEXT,
    "expectedJoiningDate" TIMESTAMP(3),
    "actualJoiningDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "timeline" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "internshipId" TEXT,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'Present',
    "checkInTime" TEXT,
    "remark" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_logs" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "internshipId" TEXT,
    "date" DATE NOT NULL,
    "workCompleted" TEXT NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "challenges" TEXT,
    "learning" TEXT,
    "tomorrowPlan" TEXT,
    "status" "WorkLogStatus" NOT NULL DEFAULT 'Submitted',
    "facultyComment" TEXT,
    "submittedDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "performanceRating" INTEGER NOT NULL DEFAULT 4,
    "communicationRating" INTEGER NOT NULL DEFAULT 4,
    "technicalRating" INTEGER NOT NULL DEFAULT 4,
    "professionalismRating" INTEGER NOT NULL DEFAULT 4,
    "teamworkRating" INTEGER NOT NULL DEFAULT 4,
    "overallRating" INTEGER NOT NULL DEFAULT 4,
    "comments" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_collegeId_key" ON "student_profiles"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_userId_key" ON "company_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_profiles_userId_key" ON "faculty_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_profiles_employeeId_key" ON "faculty_profiles"("employeeId");

-- CreateIndex
CREATE INDEX "student_mentor_assignments_facultyId_idx" ON "student_mentor_assignments"("facultyId");

-- CreateIndex
CREATE INDEX "student_mentor_assignments_studentId_idx" ON "student_mentor_assignments"("studentId");

-- CreateIndex
CREATE INDEX "internships_companyId_idx" ON "internships"("companyId");

-- CreateIndex
CREATE INDEX "internships_status_idx" ON "internships"("status");

-- CreateIndex
CREATE INDEX "internship_applications_studentId_idx" ON "internship_applications"("studentId");

-- CreateIndex
CREATE INDEX "internship_applications_internshipId_idx" ON "internship_applications"("internshipId");

-- CreateIndex
CREATE UNIQUE INDEX "internship_applications_internshipId_studentId_key" ON "internship_applications"("internshipId", "studentId");

-- CreateIndex
CREATE INDEX "attendance_records_studentId_idx" ON "attendance_records"("studentId");

-- CreateIndex
CREATE INDEX "attendance_records_internshipId_idx" ON "attendance_records"("internshipId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_studentId_date_key" ON "attendance_records"("studentId", "date");

-- CreateIndex
CREATE INDEX "work_logs_studentId_idx" ON "work_logs"("studentId");

-- CreateIndex
CREATE INDEX "work_logs_internshipId_idx" ON "work_logs"("internshipId");

-- CreateIndex
CREATE INDEX "feedbacks_studentId_idx" ON "feedbacks"("studentId");

-- CreateIndex
CREATE INDEX "feedbacks_companyId_idx" ON "feedbacks"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_internshipId_studentId_key" ON "feedbacks"("internshipId", "studentId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_mentor_assignments" ADD CONSTRAINT "student_mentor_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_mentor_assignments" ADD CONSTRAINT "student_mentor_assignments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
