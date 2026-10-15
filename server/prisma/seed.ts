import { PrismaClient, Role, WorkMode, InternshipStatus, ApplicationStatus, AttendanceStatus, WorkLogStatus, AssignmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting InternLink database seed...')

  // Clean existing data in reverse dependency order
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.workLog.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.internshipApplication.deleteMany()
  await prisma.internship.deleteMany()
  await prisma.studentMentorAssignment.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.companyProfile.deleteMany()
  await prisma.facultyProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing tables.')

  // Password hashes
  const studentPw = await bcrypt.hash('student123', 10)
  const companyPw = await bcrypt.hash('company123', 10)
  const facultyPw = await bcrypt.hash('faculty123', 10)
  const adminPw = await bcrypt.hash('admin123', 10)

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@internlink.demo',
      passwordHash: adminPw,
      name: 'Dr. Suresh Kumar (TPO Head)',
      role: Role.ADMIN,
    },
  })
  console.log('✅ Created Admin user:', adminUser.email)

  // 2. Create Faculty Mentors (at least two with distinct student allocations)
  const faculty1User = await prisma.user.create({
    data: {
      email: 'faculty@internlink.demo',
      passwordHash: facultyPw,
      name: 'Dr. Priya Nair',
      role: Role.FACULTY,
    },
  })
  const faculty1Profile = await prisma.facultyProfile.create({
    data: {
      userId: faculty1User.id,
      name: 'Dr. Priya Nair',
      phone: '+91 98765 10000',
      department: 'Computer Science',
      college: 'VIT Chennai',
      designation: 'Professor & Internship Coordinator',
      employeeId: 'EMP-CS-001',
    },
  })

  const faculty2User = await prisma.user.create({
    data: {
      email: 'rajesh@internlink.demo',
      passwordHash: facultyPw,
      name: 'Prof. Rajesh Kumar',
      role: Role.FACULTY,
    },
  })
  const faculty2Profile = await prisma.facultyProfile.create({
    data: {
      userId: faculty2User.id,
      name: 'Prof. Rajesh Kumar',
      phone: '+91 98765 10001',
      department: 'Information Technology',
      college: 'VIT Chennai',
      designation: 'Associate Professor',
      employeeId: 'EMP-IT-002',
    },
  })
  console.log('✅ Created 2 Faculty Mentors: Dr. Priya Nair & Prof. Rajesh Kumar')

  // 3. Create Companies
  const company1User = await prisma.user.create({
    data: {
      email: 'company@internlink.demo',
      passwordHash: companyPw,
      name: 'TechNova Solutions',
      role: Role.COMPANY,
    },
  })
  const company1Profile = await prisma.companyProfile.create({
    data: {
      userId: company1User.id,
      name: 'TechNova Solutions',
      phone: '+91 80 1234 5678',
      industry: 'Software Development',
      website: 'https://www.technova.in',
      description: 'TechNova Solutions is a leading software development company specializing in enterprise web applications, cloud solutions, and digital transformation.',
      location: 'Bengaluru, Karnataka',
      logoColor: 'bg-blue-600',
    },
  })

  const company2User = await prisma.user.create({
    data: {
      email: 'careers@innovatex.in',
      passwordHash: companyPw,
      name: 'InnovateX Labs',
      role: Role.COMPANY,
    },
  })
  const company2Profile = await prisma.companyProfile.create({
    data: {
      userId: company2User.id,
      name: 'InnovateX Labs',
      phone: '+91 80 7890 1234',
      industry: 'AI/ML & Deep Tech',
      website: 'https://www.innovatex.in',
      description: 'InnovateX builds AI-powered SaaS products for enterprise automation, specialising in NLP, computer vision, and document processing.',
      location: 'Bengaluru, Karnataka',
      logoColor: 'bg-indigo-600',
    },
  })

  const company3User = await prisma.user.create({
    data: {
      email: 'hr@cloudsphere.in',
      passwordHash: companyPw,
      name: 'CloudSphere Technologies',
      role: Role.COMPANY,
    },
  })
  const company3Profile = await prisma.companyProfile.create({
    data: {
      userId: company3User.id,
      name: 'CloudSphere Technologies',
      phone: '+91 80 5678 9012',
      industry: 'Cloud & DevOps',
      website: 'https://www.cloudsphere.in',
      description: 'CloudSphere provides cloud consulting, DevOps automation, and managed cloud architecture.',
      location: 'Bengaluru, Karnataka',
      logoColor: 'bg-cyan-600',
    },
  })
  console.log('✅ Created Companies (TechNova, InnovateX, CloudSphere)')

  // 4. Create Students (Total 20 realistic students)
  const rawStudents = [
    { name: 'Aarav Sharma', email: 'student@internlink.demo', phone: '+91 98765 43210', collegeId: 'VIT21CS001', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'Passionate full-stack developer with interest in web technologies and cloud computing.', skills: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL'], completion: 85 },
    { name: 'Diya Patel', email: 'diya.p@vit.ac.in', phone: '+91 98765 11111', collegeId: 'VIT22CS045', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'Embedded systems and frontend developer.', skills: ['C++', 'React', 'TypeScript', 'Python'], completion: 78 },
    { name: 'Arjun Reddy', email: 'arjun.r@vit.ac.in', phone: '+91 99887 22222', collegeId: 'VIT22CS010', course: 'B.Tech Computer Science', year: '4th Year', dept: 'Computer Science', bio: 'Data science and ML enthusiast, Kaggle winner.', skills: ['Python', 'TensorFlow', 'SQL', 'Scikit-learn'], completion: 92 },
    { name: 'Ananya Gupta', email: 'ananya.g@vit.ac.in', phone: '+91 98123 33333', collegeId: 'VIT21CS078', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'UI/UX designer turned frontend developer.', skills: ['Figma', 'React', 'TypeScript', 'CSS', 'Tailwind'], completion: 88 },
    { name: 'Vikram Singh', email: 'vikram.s@vit.ac.in', phone: '+91 97000 44444', collegeId: 'VIT22CS032', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'Backend architecture and system programming.', skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'], completion: 65 },
    { name: 'Sneha Iyer', email: 'sneha.i@vit.ac.in', phone: '+91 98000 55555', collegeId: 'VIT21CS020', course: 'B.Tech Computer Science', year: '4th Year', dept: 'Computer Science', bio: 'Research-oriented data scientist with NLP experience.', skills: ['Python', 'NLP', 'PyTorch', 'SQL'], completion: 90 },
    { name: 'Rohan Mehta', email: 'rohan.m@vit.ac.in', phone: '+91 99000 66666', collegeId: 'VIT21CS088', course: 'B.Tech Computer Science', year: '4th Year', dept: 'Computer Science', bio: 'Backend developer specializing in microservices.', skills: ['Java', 'Docker', 'Kubernetes', 'PostgreSQL'], completion: 82 },
    { name: 'Kavya Nair', email: 'kavya.n@vit.ac.in', phone: '+91 91234 77777', collegeId: 'VIT21CS099', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'Cybersecurity enthusiast and CTF player.', skills: ['Python', 'Linux', 'Burp Suite', 'Networking'], completion: 75 },
    { name: 'Aditya Verma', email: 'aditya.v@vit.ac.in', phone: '+91 92345 88888', collegeId: 'VIT22CS055', course: 'B.Tech Computer Science', year: '3rd Year', dept: 'Computer Science', bio: 'Cloud computing and DevOps enthusiast.', skills: ['AWS', 'Terraform', 'Python', 'Docker'], completion: 80 },
    { name: 'Priya Desai', email: 'priya.d@vit.ac.in', phone: '+91 93456 99999', collegeId: 'VIT21CS044', course: 'B.Tech Computer Science', year: '4th Year', dept: 'Computer Science', bio: 'Business analytics and data pipelines.', skills: ['SQL', 'Power BI', 'Tableau', 'Python'], completion: 70 },
    // Group 2 (Assigned to Prof. Rajesh Kumar)
    { name: 'Karthik Raj', email: 'karthik.r@vit.ac.in', phone: '+91 94567 10101', collegeId: 'VIT22IT066', course: 'B.Tech IT', year: '2nd Year', dept: 'Information Technology', bio: 'AI/ML developer building computer vision apps.', skills: ['Python', 'OpenCV', 'TensorFlow', 'C++'], completion: 68 },
    { name: 'Ishita Kumar', email: 'ishita.k@vit.ac.in', phone: '+91 95678 20202', collegeId: 'VIT21IT102', course: 'B.Tech IT', year: '3rd Year', dept: 'Information Technology', bio: 'Full-stack developer interested in fintech.', skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'], completion: 84 },
    { name: 'Nikhil Joshi', email: 'nikhil.j@vit.ac.in', phone: '+91 96789 30303', collegeId: 'VIT22IT011', course: 'B.Tech IT', year: '3rd Year', dept: 'Information Technology', bio: 'Systems programmer with interest in compilers.', skills: ['C', 'C++', 'Rust', 'Linux'], completion: 72 },
    { name: 'Meera Krishnan', email: 'meera.k@vit.ac.in', phone: '+91 97890 40404', collegeId: 'VIT21IT077', course: 'B.Tech IT', year: '4th Year', dept: 'Information Technology', bio: 'Mobile app developer with flutter.', skills: ['Flutter', 'Dart', 'Firebase', 'Java'], completion: 86 },
    { name: 'Sai Teja', email: 'sai.t@vit.ac.in', phone: '+91 98901 50505', collegeId: 'VIT22IT028', course: 'B.Tech IT', year: '3rd Year', dept: 'Information Technology', bio: 'Quant finance enthusiast and competitive programmer.', skills: ['Python', 'C++', 'SQL', 'Algorithms'], completion: 77 },
    { name: 'Riya Agarwal', email: 'riya.a@vit.ac.in', phone: '+91 99012 60606', collegeId: 'VIT22IT091', course: 'B.Tech IT', year: '3rd Year', dept: 'Information Technology', bio: 'Web security and API tester.', skills: ['Python', 'JavaScript', 'OWASP', 'Linux'], completion: 71 },
    { name: 'Harish Pandey', email: 'harish.p@vit.ac.in', phone: '+91 90123 70707', collegeId: 'VIT22IT050', course: 'B.Tech IT', year: '2nd Year', dept: 'Information Technology', bio: 'Deep learning researcher working on NLP.', skills: ['Python', 'PyTorch', 'Transformers', 'AWS'], completion: 66 },
    { name: 'Tanvi Bhat', email: 'tanvi.b@vit.ac.in', phone: '+91 91234 80808', collegeId: 'VIT21IT067', course: 'B.Tech IT', year: '4th Year', dept: 'Information Technology', bio: 'Cloud architect in the making, AWS certified.', skills: ['AWS', 'Terraform', 'Python', 'Docker'], completion: 89 },
    { name: 'Yash Chauhan', email: 'yash.c@vit.ac.in', phone: '+91 92345 90909', collegeId: 'VIT22IT033', course: 'B.Tech IT', year: '2nd Year', dept: 'Information Technology', bio: 'Web developer passionate about open source.', skills: ['JavaScript', 'React', 'Node.js', 'Git'], completion: 60 },
    { name: 'Sara Mathew', email: 'sara.m@vit.ac.in', phone: '+91 93456 10111', collegeId: 'VIT21IT049', course: 'B.Tech IT', year: '4th Year', dept: 'Information Technology', bio: 'Software engineer interested in databases.', skills: ['Go', 'PostgreSQL', 'Redis', 'Docker'], completion: 83 },
  ]

  const createdStudents = []
  for (let i = 0; i < rawStudents.length; i++) {
    const s = rawStudents[i]
    const u = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: studentPw,
        name: s.name,
        role: Role.STUDENT,
      },
    })
    const sp = await prisma.studentProfile.create({
      data: {
        userId: u.id,
        phone: s.phone,
        college: 'VIT Chennai',
        collegeId: s.collegeId,
        course: s.course,
        year: s.year,
        department: s.dept,
        bio: s.bio,
        skills: JSON.stringify(s.skills),
        linkedin: `https://linkedin.com/in/${s.name.toLowerCase().replace(' ', '')}`,
        github: `https://github.com/${s.name.toLowerCase().replace(' ', '')}`,
        resumeName: `${s.name.replace(' ', '_')}_Resume.pdf`,
        profileCompletion: s.completion,
      },
    })
    createdStudents.push({ user: u, profile: sp })
  }
  console.log(`✅ Created ${createdStudents.length} Students`)

  // 5. CRITICAL: Assign Students to Faculty Mentors
  // Dr. Priya Nair gets students 0..9 (10 students)
  for (let i = 0; i < 10; i++) {
    await prisma.studentMentorAssignment.create({
      data: {
        studentId: createdStudents[i].profile.id,
        facultyId: faculty1Profile.id,
        assignedBy: adminUser.name,
        status: AssignmentStatus.ACTIVE,
      },
    })
  }

  // Prof. Rajesh Kumar gets students 10..19 (10 students)
  for (let i = 10; i < 20; i++) {
    await prisma.studentMentorAssignment.create({
      data: {
        studentId: createdStudents[i].profile.id,
        facultyId: faculty2Profile.id,
        assignedBy: adminUser.name,
        status: AssignmentStatus.ACTIVE,
      },
    })
  }
  console.log('✅ Created Student-Mentor Assignments: 10 to Dr. Priya Nair, 10 to Prof. Rajesh Kumar')

  // 6. Create Internships with Exact Dates & Logistics
  const intern1 = await prisma.internship.create({
    data: {
      companyId: company1Profile.id,
      title: 'Frontend Developer Intern',
      description: 'Join our frontend engineering team to build responsive, accessible web applications using React, TypeScript, and modern state architectures.',
      responsibilities: JSON.stringify([
        'Build reusable React components with Tailwind CSS',
        'Integrate RESTful and GraphQL backend endpoints',
        'Write clean unit tests using Vitest/Jest',
        'Participate in agile sprints and code reviews',
      ]),
      requiredSkills: JSON.stringify(['React', 'TypeScript', 'HTML', 'CSS', 'Tailwind']),
      eligibility: 'B.Tech CS/IT 3rd or 4th year, CGPA >= 7.0',
      location: 'Bengaluru, Karnataka',
      workMode: WorkMode.Hybrid,
      duration: '6 months',
      startDate: new Date('2026-01-15T09:00:00.000Z'),
      endDate: new Date('2026-07-15T18:00:00.000Z'),
      deadline: new Date('2026-12-15T23:59:59.000Z'),
      stipend: 15000,
      openings: 3,
      benefits: JSON.stringify(['Direct mentorship from senior staff', 'Certificate of internship completion', 'Pre-placement offer opportunity']),
      status: InternshipStatus.Open,
      type: 'Software Development',
    },
  })

  const intern2 = await prisma.internship.create({
    data: {
      companyId: company1Profile.id,
      title: 'Backend Developer Intern',
      description: 'Architect scalable microservices using Node.js, Express, and PostgreSQL. Design schemas and optimize query throughput.',
      responsibilities: JSON.stringify([
        'Develop RESTful APIs and authentication pipelines',
        'Implement relational database migrations with Prisma',
        'Write integration tests and performance benchmarks',
      ]),
      requiredSkills: JSON.stringify(['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'REST API']),
      eligibility: 'B.Tech CS/IT 3rd or 4th year, CGPA >= 7.5',
      location: 'Bengaluru, Karnataka',
      workMode: WorkMode.On_site,
      duration: '6 months',
      startDate: new Date('2026-01-15T09:00:00.000Z'),
      endDate: new Date('2026-07-15T18:00:00.000Z'),
      deadline: new Date('2026-12-15T23:59:59.000Z'),
      stipend: 18000,
      openings: 2,
      benefits: JSON.stringify(['Mentorship', 'PPO opportunity', 'Free meals and transport']),
      status: InternshipStatus.Open,
      type: 'Software Development',
    },
  })

  const intern3 = await prisma.internship.create({
    data: {
      companyId: company2Profile.id,
      title: 'AI/ML Engineering Intern',
      description: 'Train and evaluate transformer models and computer vision pipelines for real-world enterprise deployments.',
      responsibilities: JSON.stringify([
        'Preprocess text and visual datasets',
        'Fine-tune open weights LLMs using PyTorch and HuggingFace',
        'Deploy low-latency inference microservices',
      ]),
      requiredSkills: JSON.stringify(['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Docker']),
      eligibility: 'B.Tech/M.Tech CS/AI/Data Science, CGPA >= 8.0',
      location: 'Bengaluru, Karnataka',
      workMode: WorkMode.Hybrid,
      duration: '6 months',
      startDate: new Date('2026-01-20T09:00:00.000Z'),
      endDate: new Date('2026-07-20T18:00:00.000Z'),
      deadline: new Date('2026-12-10T23:59:59.000Z'),
      stipend: 25000,
      openings: 2,
      benefits: JSON.stringify(['Dedicated GPU cluster compute', 'Research publication support', 'PPO opportunity']),
      status: InternshipStatus.Open,
      type: 'AI/ML',
    },
  })

  const intern4 = await prisma.internship.create({
    data: {
      companyId: company3Profile.id,
      title: 'Cloud Engineering & DevOps Intern',
      description: 'Automate multi-region AWS cloud infrastructure using Terraform, Kubernetes, and GitHub Actions CI/CD.',
      responsibilities: JSON.stringify([
        'Maintain infrastructure-as-code templates in Terraform',
        'Manage Kubernetes pods and ingress controllers',
        'Monitor system metrics via Prometheus and Grafana',
      ]),
      requiredSkills: JSON.stringify(['AWS', 'Linux', 'Terraform', 'Docker', 'Python']),
      eligibility: 'B.Tech CS/IT 3rd or 4th year, CGPA >= 7.0',
      location: 'Bengaluru, Karnataka',
      workMode: WorkMode.Remote,
      duration: '6 months',
      startDate: new Date('2026-01-15T09:00:00.000Z'),
      endDate: new Date('2026-07-15T18:00:00.000Z'),
      deadline: new Date('2026-12-15T23:59:59.000Z'),
      stipend: 20000,
      openings: 2,
      benefits: JSON.stringify(['AWS certification sponsorship', 'Flexible remote hours', 'Certificate of excellence']),
      status: InternshipStatus.Open,
      type: 'Cloud & DevOps',
    },
  })
  console.log('✅ Created 4 Internships with exact date schedules')

  // 7. Create Applications for Aarav Sharma (student 0) and others
  const aarav = createdStudents[0].profile
  const app1 = await prisma.internshipApplication.create({
    data: {
      internshipId: intern1.id,
      studentId: aarav.id,
      coverLetter: 'I am passionate about frontend development and have built multiple responsive full-stack applications with React and TypeScript.',
      status: ApplicationStatus.Selected,
      appliedDate: new Date('2026-10-01T10:00:00.000Z'),
      expectedJoiningDate: new Date('2026-01-15T09:00:00.000Z'),
      actualJoiningDate: new Date('2026-01-15T09:00:00.000Z'),
      interviewDate: new Date('2026-10-05T11:00:00.000Z'),
      interviewTime: '11:00 AM',
      interviewLink: 'https://meet.google.com/internlink-aarav-interview',
      interviewNotes: 'Strong frontend fundamentals, proficient in React component architecture and Tailwind.',
      timeline: JSON.stringify([
        { status: 'Applied', date: '2026-10-01', note: 'Application submitted online' },
        { status: 'Shortlisted', date: '2026-10-03', note: 'Shortlisted by HR based on GitHub portfolio' },
        { status: 'Interview Scheduled', date: '2026-10-04', note: 'Technical interview conducted on Oct 05' },
        { status: 'Selected', date: '2026-10-07', note: 'Offered position with joining on Jan 15, 2026' },
      ]),
    },
  })

  const app2 = await prisma.internshipApplication.create({
    data: {
      internshipId: intern3.id,
      studentId: aarav.id,
      coverLetter: 'I am enthusiastic about integrating deep learning pipelines into web architectures.',
      status: ApplicationStatus.Shortlisted,
      appliedDate: new Date('2026-10-02T14:30:00.000Z'),
      timeline: JSON.stringify([
        { status: 'Applied', date: '2026-10-02', note: 'Application submitted' },
        { status: 'Shortlisted', date: '2026-10-06', note: 'Shortlisted by InnovateX technical panel' },
      ]),
    },
  })

  // Create applications for other students
  const arjun = createdStudents[2].profile
  await prisma.internshipApplication.create({
    data: {
      internshipId: intern3.id,
      studentId: arjun.id,
      coverLetter: 'Extensive ML background with top-tier Kaggle finishes and PyTorch experience.',
      status: ApplicationStatus.Selected,
      appliedDate: new Date('2026-10-02T09:00:00.000Z'),
      expectedJoiningDate: new Date('2026-01-20T09:00:00.000Z'),
      actualJoiningDate: new Date('2026-01-20T09:00:00.000Z'),
      interviewDate: new Date('2026-10-05T14:00:00.000Z'),
      interviewTime: '02:00 PM',
      interviewLink: 'https://meet.google.com/innovatex-arjun-interview',
      interviewNotes: 'Excellent model fine-tuning knowledge.',
      timeline: JSON.stringify([
        { status: 'Applied', date: '2026-10-02', note: 'Application submitted' },
        { status: 'Shortlisted', date: '2026-10-04', note: 'Shortlisted' },
        { status: 'Selected', date: '2026-10-06', note: 'Selection letter dispatched' },
      ]),
    },
  })

  const ishita = createdStudents[11].profile // Assigned to Prof. Rajesh Kumar
  await prisma.internshipApplication.create({
    data: {
      internshipId: intern2.id,
      studentId: ishita.id,
      coverLetter: 'Passionate about backend systems and relational database design.',
      status: ApplicationStatus.Under_Review,
      appliedDate: new Date('2026-10-04T16:00:00.000Z'),
      timeline: JSON.stringify([
        { status: 'Applied', date: '2026-10-04', note: 'Application submitted' },
        { status: 'Under Review', date: '2026-10-05', note: 'Profile under technical review' },
      ]),
    },
  })
  console.log('✅ Created Internship Applications')

  // 8. Create Attendance Records for Aarav (demonstrating exact attendance math)
  const attendanceDates = [
    { date: '2026-10-01', status: AttendanceStatus.Present, checkIn: '09:12 AM' },
    { date: '2026-10-02', status: AttendanceStatus.Present, checkIn: '09:05 AM' },
    { date: '2026-10-03', status: AttendanceStatus.Present, checkIn: '09:15 AM' },
    { date: '2026-10-04', status: AttendanceStatus.Late, checkIn: '09:48 AM', remark: 'Traffic congestion on ORR' },
    { date: '2026-10-05', status: AttendanceStatus.Present, checkIn: '09:10 AM' },
    { date: '2026-10-06', status: AttendanceStatus.Present, checkIn: '09:00 AM' },
    { date: '2026-10-07', status: AttendanceStatus.Present, checkIn: '09:14 AM' },
    { date: '2026-10-08', status: AttendanceStatus.Leave, remark: 'Approved medical leave' },
    { date: '2026-10-09', status: AttendanceStatus.Present, checkIn: '09:08 AM' },
    { date: '2026-10-10', status: AttendanceStatus.Present, checkIn: '09:02 AM' },
  ]

  for (const item of attendanceDates) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: aarav.id,
        internshipId: intern1.id,
        date: new Date(`${item.date}T00:00:00.000Z`),
        status: item.status,
        checkInTime: item.checkIn,
        remark: item.remark,
      },
    })
  }

  // Attendance for student in group 2 (Ishita)
  await prisma.attendanceRecord.create({
    data: {
      studentId: ishita.id,
      date: new Date('2026-10-07T00:00:00.000Z'),
      status: AttendanceStatus.Present,
      checkInTime: '09:00 AM',
    },
  })
  console.log('✅ Created Attendance Records')

  // 9. Create Daily Work Logs
  await prisma.workLog.create({
    data: {
      studentId: aarav.id,
      internshipId: intern1.id,
      date: new Date('2026-10-06T00:00:00.000Z'),
      workCompleted: 'Completed onboarding documentation and configured local development environment. Built authentication mock routes in React.',
      hoursWorked: 8,
      challenges: 'Configuring Tailwind v3 typography plugins with custom Vite aliases.',
      learning: 'Understood the company component architecture and monorepo guidelines.',
      tomorrowPlan: 'Implement student profile edit forms and input validation checks.',
      status: WorkLogStatus.Reviewed,
      facultyComment: 'Good start. Ensure all form controls are fully accessible and properly validated.',
      submittedDate: new Date('2026-10-06T17:30:00.000Z'),
    },
  })

  await prisma.workLog.create({
    data: {
      studentId: aarav.id,
      internshipId: intern1.id,
      date: new Date('2026-10-07T00:00:00.000Z'),
      workCompleted: 'Implemented student dashboard overview widgets, stats cards, and interactive calendar views.',
      hoursWorked: 8,
      challenges: 'Handling date-picker timezones consistently without off-by-one errors.',
      learning: 'Using UTC date standardization across REST payloads.',
      tomorrowPlan: 'Connect real-time notifications to the faculty review updates.',
      status: WorkLogStatus.Submitted,
      submittedDate: new Date('2026-10-07T18:00:00.000Z'),
    },
  })

  // Work log for Ishita (Mentor 2 student)
  await prisma.workLog.create({
    data: {
      studentId: ishita.id,
      date: new Date('2026-10-07T00:00:00.000Z'),
      workCompleted: 'Investigated database indexing options and prepared sample Prisma schemas.',
      hoursWorked: 7.5,
      challenges: 'Understanding compound indexes in PostgreSQL.',
      learning: 'Learned the importance of foreign key indexes for query performance.',
      tomorrowPlan: 'Write unit tests for query endpoints.',
      status: WorkLogStatus.Submitted,
      submittedDate: new Date('2026-10-07T17:45:00.000Z'),
    },
  })
  console.log('✅ Created Work Logs')

  // 10. Create Feedback
  await prisma.feedback.create({
    data: {
      internshipId: intern1.id,
      studentId: aarav.id,
      companyId: company1Profile.id,
      performanceRating: 5,
      communicationRating: 4,
      technicalRating: 5,
      professionalismRating: 5,
      teamworkRating: 5,
      overallRating: 5,
      comments: 'Aarav has performed exceptionally well on all frontend modules. He delivers clean, well-tested code and collaborates effectively with the core engineers.',
      date: new Date('2026-10-07T16:00:00.000Z'),
    },
  })
  console.log('✅ Created Company Feedback')

  // 11. Create Notifications
  await prisma.notification.create({
    data: {
      userId: createdStudents[0].user.id,
      category: 'Application',
      title: 'Offer Letter Dispatched',
      description: 'TechNova Solutions has confirmed your selection for Frontend Developer Intern with joining on 15 Jan 2026.',
      read: false,
    },
  })
  await prisma.notification.create({
    data: {
      userId: faculty1User.id,
      category: 'Work Log',
      title: 'New Work Log Submitted',
      description: 'Aarav Sharma has submitted a daily work log for Oct 07, 2026 for your review.',
      read: false,
    },
  })
  console.log('✅ Created Notifications')

  // 12. Create Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'ASSIGN_STUDENT_MENTOR',
      targetType: 'STUDENT_MENTOR_ASSIGNMENT',
      targetId: faculty1Profile.id,
      details: 'Assigned 10 Computer Science students to Dr. Priya Nair',
      ipAddress: '127.0.0.1',
    },
  })
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'ASSIGN_STUDENT_MENTOR',
      targetType: 'STUDENT_MENTOR_ASSIGNMENT',
      targetId: faculty2Profile.id,
      details: 'Assigned 10 Information Technology students to Prof. Rajesh Kumar',
      ipAddress: '127.0.0.1',
    },
  })
  console.log('✅ Created Audit Logs')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
