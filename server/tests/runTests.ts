import http from 'http'
import fs from 'fs'
import path from 'path'
import app from '../src/index.js'
import { prisma } from '../src/db.js'

let server: http.Server
let baseUrl: string

async function startTestServer(): Promise<void> {
  return new Promise((resolve) => {
    // Listen on port 0 to get a random available port
    server = app.listen(0, () => {
      const addr = server.address()
      if (typeof addr === 'object' && addr !== null) {
        baseUrl = `http://localhost:${addr.port}`
        console.log(`🧪 Test server running at ${baseUrl}`)
        resolve()
      }
    })
  })
}

async function closeTestServer(): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve()
    })
  })
}

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`)
    failed++
  }
}

async function runAllTests() {
  console.log('\n======================================================')
  console.log('🚀 RUNNING INTERNLINK BACKEND VERIFICATION TEST SUITE')
  console.log('======================================================\n')

  await startTestServer()

  let studentToken = ''
  let faculty1Token = ''
  let faculty2Token = ''
  let companyToken = ''
  let adminToken = ''

  let studentIdAarav = ''
  let studentIdIshita = ''

  try {
    // TEST 1: Healthcheck
    console.log('\n[1] Health Check & Database Connectivity')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    const healthJson = await healthRes.json()
    assert(healthRes.status === 200 && healthJson.database === 'connected', 'Database connection verified via /api/health')

    // TEST 2: Authentication & Password Verification (Bcrypt)
    console.log('\n[2] Authentication & Password Verification')
    // 2a. Invalid login
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@internlink.demo', password: 'wrongpassword' }),
    })
    assert(badLoginRes.status === 401, 'Rejects invalid password with 401')

    // 2b. Valid Student login
    const studentLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@internlink.demo', password: 'student123' }),
    })
    const studentLoginJson = await studentLoginRes.json()
    assert(studentLoginRes.status === 200 && !!studentLoginJson.token, 'Student login succeeds with valid password & returns JWT')
    studentToken = studentLoginJson.token
    studentIdAarav = studentLoginJson.profile.id

    // 2c. Valid Faculty 1 (Dr. Priya Nair) login
    const faculty1LoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@internlink.demo', password: 'faculty123' }),
    })
    const faculty1LoginJson = await faculty1LoginRes.json()
    assert(faculty1LoginRes.status === 200 && faculty1LoginJson.user.role === 'faculty', 'Faculty 1 login succeeds')
    faculty1Token = faculty1LoginJson.token

    // 2d. Valid Faculty 2 (Prof. Rajesh Kumar) login
    const faculty2LoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh@internlink.demo', password: 'faculty123' }),
    })
    const faculty2LoginJson = await faculty2LoginRes.json()
    assert(faculty2LoginRes.status === 200 && faculty2LoginJson.user.role === 'faculty', 'Faculty 2 login succeeds')
    faculty2Token = faculty2LoginJson.token

    // 2e. Valid Company login
    const companyLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'company@internlink.demo', password: 'company123' }),
    })
    const companyLoginJson = await companyLoginRes.json()
    assert(companyLoginRes.status === 200 && companyLoginJson.user.role === 'company', 'Company login succeeds')
    companyToken = companyLoginJson.token

    // 2f. Valid Admin login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@internlink.demo', password: 'admin123' }),
    })
    const adminLoginJson = await adminLoginRes.json()
    assert(adminLoginRes.status === 200 && adminLoginJson.user.role === 'admin', 'Admin login succeeds')
    adminToken = adminLoginJson.token

    // TEST 3: Role-Based Access Control (RBAC)
    console.log('\n[3] Role-Based Access Control Enforcement')
    // Student attempting to access faculty routes
    const studentAsFacultyRes = await fetch(`${baseUrl}/api/faculty/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(studentAsFacultyRes.status === 403, 'Student blocked from faculty route with 403')

    // Company attempting to access admin routes
    const companyAsAdminRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    assert(companyAsAdminRes.status === 403, 'Company blocked from admin route with 403')

    // Unauthenticated request
    const noAuthRes = await fetch(`${baseUrl}/api/student/profile`)
    assert(noAuthRes.status === 401, 'Unauthenticated request rejected with 401')

    // TEST 4: CRITICAL REQUIREMENT - Mentor-Wise Data Isolation
    console.log('\n[4] Critical Feature: Mentor-Wise Student Data Isolation')

    // Faculty 1 (Dr. Priya Nair) queries her students
    const fac1StudentsRes = await fetch(`${baseUrl}/api/faculty/students`, {
      headers: { Authorization: `Bearer ${faculty1Token}` },
    })
    const fac1StudentsJson = await fac1StudentsRes.json()
    assert(fac1StudentsRes.status === 200 && fac1StudentsJson.count === 10, 'Dr. Priya Nair sees exactly her 10 assigned students (not all 20)')
    assert(fac1StudentsJson.students.some((s: any) => s.name === 'Aarav Sharma'), 'Aarav Sharma is present in Dr. Priya Nair group')
    assert(!fac1StudentsJson.students.some((s: any) => s.name === 'Ishita Kumar'), 'Ishita Kumar is NOT visible in Dr. Priya Nair group')

    // Faculty 2 (Prof. Rajesh Kumar) queries his students
    const fac2StudentsRes = await fetch(`${baseUrl}/api/faculty/students`, {
      headers: { Authorization: `Bearer ${faculty2Token}` },
    })
    const fac2StudentsJson = await fac2StudentsRes.json()
    assert(fac2StudentsRes.status === 200 && fac2StudentsJson.count === 10, 'Prof. Rajesh Kumar sees exactly his 10 assigned students')
    assert(fac2StudentsJson.students.some((s: any) => s.name === 'Ishita Kumar'), 'Ishita Kumar is present in Prof. Rajesh Kumar group')
    assert(!fac2StudentsJson.students.some((s: any) => s.name === 'Aarav Sharma'), 'Aarav Sharma is NOT visible in Prof. Rajesh Kumar group')

    // Find Ishita's student ID
    studentIdIshita = fac2StudentsJson.students.find((s: any) => s.name === 'Ishita Kumar').id

    // CRITICAL: Mentor 1 attempts direct access to a Mentor 2 student by URL
    const crossMentorAccessRes = await fetch(`${baseUrl}/api/faculty/students/${studentIdIshita}`, {
      headers: { Authorization: `Bearer ${faculty1Token}` },
    })
    assert(crossMentorAccessRes.status === 403, 'Unauthorized cross-mentor access denied with 403 Forbidden')

    // Mentor 1 attempts to review a work log of an unassigned student
    // Find Ishita's work log
    const ishitaLog = await prisma.workLog.findFirst({ where: { studentId: studentIdIshita } })
    if (ishitaLog) {
      const crossReviewRes = await fetch(`${baseUrl}/api/faculty/work-logs/${ishitaLog.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${faculty1Token}`,
        },
        body: JSON.stringify({ status: 'Reviewed', comment: 'Illegal review' }),
      })
      assert(crossReviewRes.status === 403, 'Faculty blocked from reviewing unassigned student work log with 403')
    }

    // TEST 5: Exact Internship Dates & Logistics Validation
    console.log('\n[5] Critical Feature: Exact Internship Dates & Schedule Validation')
    // 5a. Post internship with end date before start date -> must fail
    const invalidEndDateRes = await fetch(`${baseUrl}/api/company/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Schedule Role',
        description: 'Test description for invalid date scheduling role',
        responsibilities: ['Responsibility 1'],
        requiredSkills: ['Skill 1'],
        eligibility: 'B.Tech CS',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        duration: '3 months',
        startDate: '2026-06-01',
        endDate: '2026-05-01', // Before start!
        deadline: '2026-04-15',
        stipend: 15000,
        openings: 2,
        benefits: ['Certificate'],
        type: 'Software Development',
        status: 'Open',
      }),
    })
    assert(invalidEndDateRes.status === 400, 'Rejects internship creation where end date <= start date with 400')

    // 5b. Post internship with deadline after start date -> must fail
    const invalidDeadlineRes = await fetch(`${baseUrl}/api/company/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Deadline Role',
        description: 'Test description for invalid deadline role',
        responsibilities: ['Responsibility 1'],
        requiredSkills: ['Skill 1'],
        eligibility: 'B.Tech CS',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        duration: '3 months',
        startDate: '2026-06-01',
        endDate: '2026-09-01',
        deadline: '2026-06-15', // After start date!
        stipend: 15000,
        openings: 2,
        benefits: ['Certificate'],
        type: 'Software Development',
        status: 'Open',
      }),
    })
    assert(invalidDeadlineRes.status === 400, 'Rejects internship creation where deadline > start date with 400')

    // TEST 6: Attendance Calculation & Workflow
    console.log('\n[6] Attendance Recording & Exact Percentage Formula')
    const attRes = await fetch(`${baseUrl}/api/student/attendance`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const attJson = await attRes.json()
    assert(attRes.status === 200, 'Student retrieves own attendance records')
    assert(typeof attJson.stats.attendancePercentage === 'number', `Attendance percentage formula calculated: ${attJson.stats.attendancePercentage}%`)

    // TEST 7: Work-Log Submission & Review Workflow
    console.log('\n[7] Work-Log Submission & Faculty Review Lifecycle')
    // Student submits work log
    const submitLogRes = await fetch(`${baseUrl}/api/student/work-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        date: '2026-10-12',
        workCompleted: 'Implemented real REST API integration for faculty isolation.',
        hoursWorked: 8,
        challenges: 'Ensuring strict SQL join constraints.',
        learning: 'Learned about parameterized Prisma relations.',
        tomorrowPlan: 'Verify frontend dashboard integration.',
        status: 'Submitted',
      }),
    })
    const submitLogJson = await submitLogRes.json()
    assert(submitLogRes.status === 201 && submitLogJson.workLog.status === 'Submitted', 'Student successfully submits daily work log')
    const createdLogId = submitLogJson.workLog.id

    // Assigned mentor (Dr. Priya Nair) reviews this log
    const reviewLogRes = await fetch(`${baseUrl}/api/faculty/work-logs/${createdLogId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${faculty1Token}`,
      },
      body: JSON.stringify({
        status: 'Reviewed',
        comment: 'Excellent work. Verified relational constraints.',
      }),
    })
    const reviewLogJson = await reviewLogRes.json()
    assert(reviewLogRes.status === 200 && reviewLogJson.workLog.status === 'Reviewed', 'Assigned mentor successfully reviews student work log')

    // TEST 8: Admin Mentor Assignment Management
    console.log('\n[8] Admin Mentor Assignment Management & Audit Logging')
    const adminAssignmentsRes = await fetch(`${baseUrl}/api/admin/assignments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const adminAssignmentsJson = await adminAssignmentsRes.json()
    assert(adminAssignmentsRes.status === 200 && adminAssignmentsJson.count >= 20, 'Admin views all institution-wide student mentor assignments')

    // Check audit logs
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const auditJson = await auditRes.json()
    assert(auditRes.status === 200 && auditJson.count > 0, 'Audit trail records administrative and review actions')

    // TEST 9: Feature 1 - Availability Confirmation & Strict Application Validation
    console.log('\n[9] Feature 1: Availability Confirmation & Schedule Enforcement')
    
    // Post new internship with company
    const createInternshipRes = await fetch(`${baseUrl}/api/company/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({
        title: 'Cloud Systems Intern',
        description: 'Building microservices and cloud infrastructure.',
        responsibilities: ['Develop APIs', 'Manage Deployments'],
        requiredSkills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        eligibility: 'B.Tech CS / IT',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        duration: '6 months',
        startDate: '2026-12-01',
        endDate: '2027-05-31',
        deadline: '2026-11-15',
        stipend: 25000,
        openings: 3,
        benefits: ['Certificate', 'Pre-Placement Offer'],
        type: 'Software Development',
        status: 'Open',
      }),
    })
    const createInternshipJson = await createInternshipRes.json()
    const testInternshipId = createInternshipJson.internship.id
    assert(createInternshipRes.status === 201 && !!testInternshipId, 'Company creates internship with official schedule')

    // 9a: Student attempts to apply WITHOUT availabilityConfirmed -> must fail with 400
    const applyNoConfirmRes = await fetch(`${baseUrl}/api/student/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        internshipId: testInternshipId,
        coverLetter: 'I would love to join your engineering team.',
      }),
    })
    assert(applyNoConfirmRes.status === 400, 'Rejects application when availability confirmation is missing with 400')

    // 9b: Student attempts to apply with availabilityConfirmed = false -> must fail with 400
    const applyFalseConfirmRes = await fetch(`${baseUrl}/api/student/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        internshipId: testInternshipId,
        coverLetter: 'I would love to join your engineering team.',
        availabilityConfirmed: false,
      }),
    })
    assert(applyFalseConfirmRes.status === 400, 'Rejects application when availabilityConfirmed is false with 400')

    // 9c: Student applies WITH availabilityConfirmed = true -> succeeds with 201
    const applySuccessRes = await fetch(`${baseUrl}/api/student/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        internshipId: testInternshipId,
        coverLetter: 'I confirm availability for the full internship schedule.',
        availabilityConfirmed: true,
      }),
    })
    assert(applySuccessRes.status === 201, 'Student successfully applies with availabilityConfirmed = true')

    // 9d: Verify persisted application has availabilityConfirmed = true in database
    const savedApp = await prisma.internshipApplication.findFirst({
      where: { internshipId: testInternshipId, studentId: studentIdAarav },
    })
    assert(savedApp?.availabilityConfirmed === true, 'Persisted application in PostgreSQL has availabilityConfirmed = true')

    // 9e: Verify Company ViewApplications returns official startDate, endDate, and availabilityConfirmed
    const compAppsRes = await fetch(`${baseUrl}/api/company/applications`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    const compAppsJson = await compAppsRes.json()
    const targetCompApp = compAppsJson.applications.find((a: any) => a.internshipId === testInternshipId)
    assert(
      targetCompApp &&
      targetCompApp.startDate === '2026-12-01' &&
      targetCompApp.endDate === '2027-05-31' &&
      targetCompApp.availabilityConfirmed === true,
      'Company ViewApplications returns official start date, end date, and confirmed availability'
    )

    // 9f: Prevent duplicate applications
    const duplicateRes = await fetch(`${baseUrl}/api/student/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        internshipId: testInternshipId,
        coverLetter: 'Duplicate attempt',
        availabilityConfirmed: true,
      }),
    })
    assert(duplicateRes.status === 400, 'Rejects duplicate application for same internship with 400')

    // TEST 10: Feature 2 - Explainable Skill Match Score Verification
    console.log('\n[10] Feature 2: Explainable Skill Match Score Verification')
    const { calculateSkillMatch } = await import('../src/utils/skillMatcher.js')

    // 10a: Exact 100% match (case-insensitive & whitespace-trimmed)
    const exactMatch = calculateSkillMatch([' react ', 'TYPESCRIPT', 'Node.js'], ['React', 'TypeScript', 'node.js'])
    assert(exactMatch.score === 100 && exactMatch.matchedCount === 3 && exactMatch.missingSkills.length === 0, 'Calculates 100% skill match (case-insensitive, whitespace-trimmed)')

    // 10b: Partial 50% match (2 of 4)
    const partialMatch = calculateSkillMatch(['React', 'Node.js'], ['React', 'TypeScript', 'Node.js', 'PostgreSQL'])
    assert(partialMatch.score === 50 && partialMatch.matchedCount === 2 && partialMatch.missingSkills.length === 2, 'Calculates 50% partial skill match (2 of 4 required skills)')

    // 10c: 0% match when no skills match
    const zeroMatch = calculateSkillMatch(['Java', 'Spring'], ['React', 'Node.js'])
    assert(zeroMatch.score === 0 && zeroMatch.matchedCount === 0 && zeroMatch.missingSkills.length === 2, 'Calculates 0% match when student has no required skills')

    // 10d: Empty student skills prompts profile completion
    const emptyStudentMatch = calculateSkillMatch([], ['React', 'Node.js'])
    assert(emptyStudentMatch.hasStudentSkills === false && emptyStudentMatch.message?.includes('Complete your profile'), 'Prompts student to complete profile skills when empty')

    // 10e: Empty internship required skills shows not enough data
    const emptyInternshipMatch = calculateSkillMatch(['React'], [])
    assert(emptyInternshipMatch.hasRequiredSkills === false && emptyInternshipMatch.message?.includes('Not enough data'), 'Explains not enough data when internship has no required skills')

    // TEST 11: Real Resume Upload, Download & Authorization Controls
    console.log('\n[11] Feature: Real Resume Upload & Authorization Controls')

    // 11a: Successful resume upload to student profile
    const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Title (Test Resume)\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF'
    const profileResumeFormData = new FormData()
    profileResumeFormData.append('resume', new Blob([dummyPdfContent], { type: 'application/pdf' }), 'Aarav_Sharma_Resume.pdf')

    const uploadProfileRes = await fetch(`${baseUrl}/api/student/profile/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: profileResumeFormData,
    })
    const uploadProfileJson = await uploadProfileRes.json()
    assert(uploadProfileRes.status === 200 && uploadProfileJson.success === true, 'Uploads student profile resume successfully (PDF)')

    // 11b: Verify student profile has resumePath saved and file exists on disk
    const studentUser = await prisma.user.findUnique({ where: { email: 'student@internlink.demo' } })
    const studentWithResume = await prisma.studentProfile.findUnique({ where: { userId: studentUser!.id } })
    const expectedUploadDir = path.resolve(process.cwd(), 'uploads', 'resumes')
    assert(
      !!studentWithResume?.resumePath &&
      fs.existsSync(path.join(expectedUploadDir, path.basename(studentWithResume.resumePath))),
      'Profile resume metadata saved in DB and file exists on server disk'
    )

    // 11c: Student downloads own profile resume successfully
    const downloadProfileRes = await fetch(`${baseUrl}/api/student/profile/resume`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(downloadProfileRes.status === 200, 'Student downloads own profile resume successfully')

    // 11d: Rejection of invalid file type (.exe) with 400
    const invalidTypeFormData = new FormData()
    invalidTypeFormData.append('resume', new Blob(['echo bad'], { type: 'application/x-msdownload' }), 'malicious.exe')
    const badTypeRes = await fetch(`${baseUrl}/api/student/profile/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: invalidTypeFormData,
    })
    assert(badTypeRes.status === 400, 'Rejects invalid resume file type (.exe) with 400 Bad Request')

    // 11e: Rejection of oversized file (> 5MB) with 400
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0)
    const oversizedFormData = new FormData()
    oversizedFormData.append('resume', new Blob([oversizedBuffer], { type: 'application/pdf' }), 'huge_resume.pdf')
    const oversizedRes = await fetch(`${baseUrl}/api/student/profile/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: oversizedFormData,
    })
    assert(oversizedRes.status === 400, 'Rejects oversized resume file (> 5MB) with 400 Bad Request')

    // 11f: Successful internship application with custom resume upload
    const techNovaCompany = await prisma.companyProfile.findFirst({ where: { name: 'TechNova Solutions' } })
    const resumeTestInternship = await prisma.internship.create({
      data: {
        companyId: techNovaCompany!.id,
        title: 'Backend Systems Engineering Intern',
        description: 'Design and build high-throughput backend services',
        responsibilities: JSON.stringify(['Node.js', 'PostgreSQL', 'Docker']),
        requiredSkills: JSON.stringify(['Node.js', 'PostgreSQL']),
        location: 'Bengaluru, Karnataka',
        type: 'Full-time',
        workMode: 'On_site',
        duration: '6 Months',
        stipend: 32000,
        openings: 3,
        eligibility: 'B.Tech / B.E. Computer Science, IT or related fields',
        status: 'Open',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2027-04-30'),
        deadline: new Date('2026-10-31'),
      },
    })

    const appWithResumeFormData = new FormData()
    appWithResumeFormData.append('internshipId', resumeTestInternship.id)
    appWithResumeFormData.append('coverLetter', 'I have attached my tailored resume for this backend position.')
    appWithResumeFormData.append('availabilityConfirmed', 'true')
    appWithResumeFormData.append('resume', new Blob([dummyPdfContent], { type: 'application/pdf' }), 'Aarav_Systems_Resume.pdf')

    const appWithResumeRes = await fetch(`${baseUrl}/api/student/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: appWithResumeFormData,
    })
    const appWithResumeJson = await appWithResumeRes.json()
    assert(appWithResumeRes.status === 201 && appWithResumeJson.success === true, 'Submits internship application with custom resume file')
    const appliedAppId = appWithResumeJson.application?.id

    // 11g: Authorized company (TechNova) downloads applicant resume
    const companyDownloadRes = await fetch(`${baseUrl}/api/company/applications/${appliedAppId}/resume`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    assert(companyDownloadRes.status === 200, 'Authorized company downloads candidate resume with 200 OK')

    // 11h: Unauthorized company (InnovateX) attempts to download applicant resume -> 403 Forbidden
    const company2LoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'careers@innovatex.in', password: 'company123' }),
    })
    const company2LoginJson = await company2LoginRes.json()
    const company2Token = company2LoginJson.token

    const unauthorizedDownloadRes = await fetch(`${baseUrl}/api/company/applications/${appliedAppId}/resume`, {
      headers: { Authorization: `Bearer ${company2Token}` },
    })
    assert(unauthorizedDownloadRes.status === 403, 'Unauthorized cross-company resume access rejected with 403 Forbidden')

    // 11i: Missing/Non-existent application resume returns 404
    const missingAppResumeRes = await fetch(`${baseUrl}/api/company/applications/non-existent-application-id/resume`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    })
    assert(missingAppResumeRes.status === 404, 'Non-existent application resume request returns 404 Not Found')

  } catch (error) {
    console.error('Fatal error during test execution:', error)
    failed++
  } finally {
    await closeTestServer()
  }

  console.log('\n======================================================')
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('======================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runAllTests()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
