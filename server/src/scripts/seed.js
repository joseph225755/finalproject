import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import Document from '../models/Document.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const seedData = async () => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('ABORT: Development seed script cannot run in production environment!');
    process.exit(1);
  }

  try {
    await connectDB();
    logger.info('Clearing existing demo data...');

    // Clear only test/demo accounts
    const demoEmails = ['student@interntrack.edu', 'admin@interntrack.edu'];
    const existingUsers = await User.find({ email: { $in: demoEmails } });
    const userIds = existingUsers.map((u) => u._id);

    await Task.deleteMany({ student: { $in: userIds } });
    await ActivityLog.deleteMany({ student: { $in: userIds } });
    await Project.deleteMany({ student: { $in: userIds } });
    await Milestone.deleteMany({ student: { $in: userIds } });
    await Document.deleteMany({ student: { $in: userIds } });
    await Internship.deleteMany({ student: { $in: userIds } });
    await User.deleteMany({ email: { $in: demoEmails } });

    logger.info('Creating demo users...');

    // 1. Create Student User
    const student = await User.create({
      name: 'Alex Johnson',
      email: 'student@interntrack.edu',
      password: 'StudentPass123!',
      role: 'student',
      studentId: 'CS2026-8910',
      college: 'Institute of Engineering & Technology',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 234-5678'
    });

    // 2. Create Admin User
    const admin = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@interntrack.edu',
      password: 'AdminSecurePass123!',
      role: 'admin',
      college: 'Institute of Engineering & Technology',
      department: 'Academic Internship Directorate',
      phone: '+1 (555) 987-6543'
    });

    logger.info('Creating student internship record...');

    // 3. Create Internship
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Started 30 days ago
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 60); // Ends in 60 days

    const internship = await Internship.create({
      student: student._id,
      title: 'Full Stack Development Intern',
      company: 'TechNova Cloud Solutions Inc.',
      supervisorName: 'David Vance',
      supervisorEmail: 'd.vance@technovacloud.io',
      supervisorPhone: '+1 (555) 345-6789',
      department: 'Cloud Platform Engineering',
      location: 'Hybrid',
      stipend: '$2,500 / month',
      startDate,
      endDate,
      status: 'In Progress',
      description: 'Engineering resilient cloud workflows, scalable microservices, and React frontend portals for enterprise clients.',
      objectives: '1. Master production full-stack MERN workflows.\n2. Implement secure JWT authentication and role-based access.\n3. Architect scalable MongoDB document schemas with indexes.\n4. Build and deploy containerized microservices to cloud hosting.'
    });

    logger.info('Creating student projects & milestones...');

    // 4. Create Project
    const project = await Project.create({
      student: student._id,
      internship: internship._id,
      title: 'Enterprise Analytics Dashboard',
      description: 'A real-time telemetry and reporting portal featuring live charts, task delegation, and automated PDF export.',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Recharts'],
      startDate,
      targetCompletionDate: endDate,
      status: 'In Progress',
      repositoryUrl: 'https://github.com/intern-org/analytics-dashboard',
      liveUrl: 'https://analytics-demo.technova.io'
    });

    // Milestones
    await Milestone.create([
      {
        project: project._id,
        student: student._id,
        title: 'Phase 1: Architecture & API Schema Design',
        description: 'Design ER diagrams, RESTful API endpoints, and authentication contracts.',
        targetDate: new Date(Date.now() - 15 * 86400000),
        completionPercentage: 100,
        status: 'Completed',
        notes: 'API contracts reviewed and approved by lead architect.'
      },
      {
        project: project._id,
        student: student._id,
        title: 'Phase 2: Core Frontend Dashboard & Charts',
        description: 'Implement interactive KPI widgets, Recharts distribution graphs, and theme styling.',
        targetDate: new Date(Date.now() - 2 * 86400000),
        completionPercentage: 100,
        status: 'Completed',
        notes: 'Merged to staging branch after passing code review.'
      },
      {
        project: project._id,
        student: student._id,
        title: 'Phase 3: Real-Time Notifications & Export Engine',
        description: 'Implement websocket notifications and automated PDF progress report generator.',
        targetDate: new Date(Date.now() + 15 * 86400000),
        completionPercentage: 65,
        status: 'In Progress',
        notes: 'Print-to-PDF formatting in active development.'
      },
      {
        project: project._id,
        student: student._id,
        title: 'Phase 4: Load Testing & Production Deployment',
        description: 'Stress-test API endpoints, verify Helmet headers, and deploy to Render hosting.',
        targetDate: new Date(Date.now() + 45 * 86400000),
        completionPercentage: 0,
        status: 'Pending',
        notes: 'Scheduled for final sprint.'
      }
    ]);

    logger.info('Creating sample tasks...');

    // 5. Create Tasks
    const tasks = [
      {
        student: student._id,
        internship: internship._id,
        project: project._id,
        title: 'Implement JWT refresh rotation & cookie fallback',
        description: 'Add secure HttpOnly cookie verification alongside Bearer token headers.',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date(Date.now() - 5 * 86400000),
        category: 'Backend Security',
        tags: ['JWT', 'Express', 'Auth'],
        completedAt: new Date(Date.now() - 4 * 86400000)
      },
      {
        student: student._id,
        internship: internship._id,
        project: project._id,
        title: 'Design responsive task Kanban board view',
        description: 'Create column-based board view with drag-friendly state transitions and filter controls.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date(Date.now() - 2 * 86400000),
        category: 'Frontend UI',
        tags: ['React', 'Tailwind', 'UX'],
        completedAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        student: student._id,
        internship: internship._id,
        project: project._id,
        title: 'Optimize MongoDB indexes for dashboard aggregates',
        description: 'Add compound indexes on {student: 1, date: -1} and {student: 1, status: 1}.',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 2 * 86400000),
        category: 'Database Architecture',
        tags: ['MongoDB', 'Performance', 'Mongoose']
      },
      {
        student: student._id,
        internship: internship._id,
        project: project._id,
        title: 'Draft weekly sprint summary and mentor review document',
        description: 'Compile logged activity hours and submit evaluation form to supervisor.',
        priority: 'Medium',
        status: 'To Do',
        dueDate: new Date(Date.now() + 5 * 86400000),
        category: 'Documentation',
        tags: ['Report', 'Milestone']
      },
      {
        student: student._id,
        internship: internship._id,
        project: project._id,
        title: 'Configure automated Render Static Site deploy preview',
        description: 'Setup build rewrite rules and test environment variable injection.',
        priority: 'Low',
        status: 'To Do',
        dueDate: new Date(Date.now() + 9 * 86400000),
        category: 'DevOps & CI/CD',
        tags: ['Render', 'Hosting']
      }
    ];

    await Task.create(tasks);

    logger.info('Creating activity logs...');

    // 6. Create Activity Logs
    const activities = [
      {
        student: student._id,
        internship: internship._id,
        date: new Date(Date.now() - 6 * 86400000),
        hoursSpent: 7.5,
        workCompleted: 'Configured project architecture, Express middleware chains, and secured CORS origins.',
        skillsLearned: 'Express.js architecture, Helmet security policies, CORS whitelist setup',
        challenges: 'Handling pre-flight OPTIONS requests in cross-origin environments',
        nextSteps: 'Create Mongoose models and relationship schemas',
        status: 'Reviewed',
        mentorFeedback: 'Excellent architecture layout. Good attention to security best practices.'
      },
      {
        student: student._id,
        internship: internship._id,
        date: new Date(Date.now() - 5 * 86400000),
        hoursSpent: 8.0,
        workCompleted: 'Implemented User, Internship, Task, and ActivityLog Mongoose models with validation hooks.',
        skillsLearned: 'MongoDB compound indexes, Mongoose virtuals and pre-save password hashing',
        challenges: 'Ensuring strict type checking on dates and status enum invariants',
        nextSteps: 'Build authentication controllers and JWT token signing',
        status: 'Reviewed',
        mentorFeedback: 'Clean schema structure. Proceed with auth endpoints.'
      },
      {
        student: student._id,
        internship: internship._id,
        date: new Date(Date.now() - 3 * 86400000),
        hoursSpent: 7.0,
        workCompleted: 'Constructed React Vite client scaffold, Tailwind theme palette, and authentication context.',
        skillsLearned: 'Vite configuration, Tailwind customization, React Context API for global state',
        challenges: 'Managing token synchronization across browser page reloads',
        nextSteps: 'Build Kanban task board and list views with search and filter controls',
        status: 'Reviewed',
        mentorFeedback: 'UI design looks professional and clean.'
      },
      {
        student: student._id,
        internship: internship._id,
        date: new Date(Date.now() - 1 * 86400000),
        hoursSpent: 6.5,
        workCompleted: 'Integrated Recharts for weekly productivity tracking and task status distribution pie charts.',
        skillsLearned: 'Recharts ResponsiveContainer, SVG data rendering, client-side aggregate mapping',
        challenges: 'Calculating dynamic date intervals for past 7 days',
        nextSteps: 'Implement document attachments and formal progress report printable layout',
        status: 'Submitted'
      }
    ];

    await ActivityLog.create(activities);

    logger.info('Creating document attachments...');

    // 7. Create Documents
    await Document.create([
      {
        student: student._id,
        internship: internship._id,
        title: 'Internship Offer Letter & Terms',
        category: 'Offer Letter',
        fileName: 'TechNova_Offer_Letter_2026.pdf',
        fileUrl: 'https://example.com/docs/offer-letter.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        description: 'Formal internship acceptance letter issued by TechNova HR department.'
      },
      {
        student: student._id,
        internship: internship._id,
        title: 'Mid-Term Project Architecture Specification',
        category: 'Project Documentation',
        fileName: 'InternTrack_System_Architecture_V1.pdf',
        fileUrl: 'https://example.com/docs/architecture-v1.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576,
        description: 'Complete high-level design specification, ER diagram, and REST API contract.'
      }
    ]);

    logger.info('====================================================');
    logger.info('DEMO SEED COMPLETED SUCCESSFULLY!');
    logger.info('----------------------------------------------------');
    logger.info('Student Login:');
    logger.info('  Email:    student@interntrack.edu');
    logger.info('  Password: StudentPass123!');
    logger.info('Admin Login:');
    logger.info('  Email:    admin@interntrack.edu');
    logger.info('  Password: AdminSecurePass123!');
    logger.info('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Database seed error:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
