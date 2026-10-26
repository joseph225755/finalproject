import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { internshipService } from '../services/internshipService';
import { taskService } from '../services/taskService';
import { activityService } from '../services/activityService';
import { projectService } from '../services/projectService';
import { Button } from '../components/common/Button';
import { SkeletonPage } from '../components/common/Skeleton';
import { Printer, Download, Award, CheckCircle2, Clock, Calendar, Building, User } from 'lucide-react';

export const ReportPage = () => {
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [internRes, taskRes, actRes, projRes] = await Promise.all([
          internshipService.getMyInternship().catch(() => ({ internship: null })),
          taskService.getAllTasks().catch(() => ({ tasks: [] })),
          activityService.getActivities({ limit: 100 }).catch(() => ({ activities: [] })),
          projectService.getProjects().catch(() => ({ projects: [] }))
        ]);

        setInternship(internRes.internship);
        setTasks(taskRes.tasks || []);
        setActivities(actRes.activities || []);
        setProjects(projRes.projects || []);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <SkeletonPage />;
  }

  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const totalHours = activities.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);

  // Extract unique skills learned
  const allSkills = new Set();
  activities.forEach((a) => {
    if (a.skillsLearned) {
      a.skillsLearned.split(',').forEach((s) => allSkills.add(s.trim()));
    }
  });

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Internship Progress Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Print-ready comprehensive report formatted for academic submission and Summer Internship evaluation
          </p>
        </div>

        <Button onClick={handlePrint} icon={Printer} size="md">
          Print / Save as PDF
        </Button>
      </div>

      {/* Printable Report Document Container */}
      <div className="print-page-container bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-md text-slate-800 font-sans max-w-4xl mx-auto space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-indigo-900 pb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-700 block">
              ICT Summer Internship Evaluation
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              INTERNSHIP PROGRESS REPORT
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Document Reference: IT-REP-{new Date().getFullYear()}-{user?._id?.substring(0, 6)?.toUpperCase()}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Date Generated:</p>
            <p>{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>

        {/* Section 1: Student & Internship Information */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            1. Student & Placement Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-500 font-semibold">Student Name:</p>
              <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
              <p className="text-slate-500 font-semibold mt-2">Student ID / Roll:</p>
              <p className="font-medium text-slate-800">{user?.studentId || 'N/A'}</p>
              <p className="text-slate-500 font-semibold mt-2">College / Institution:</p>
              <p className="font-medium text-slate-800">{user?.college || 'N/A'}</p>
              <p className="text-slate-500 font-semibold mt-2">Department:</p>
              <p className="font-medium text-slate-800">{user?.department || 'N/A'}</p>
            </div>

            <div>
              <p className="text-slate-500 font-semibold">Internship Position:</p>
              <p className="font-bold text-slate-900 text-sm">{internship?.title || 'Full Stack Intern'}</p>
              <p className="text-slate-500 font-semibold mt-2">Organization:</p>
              <p className="font-medium text-slate-800">{internship?.company || 'N/A'}</p>
              <p className="text-slate-500 font-semibold mt-2">Mentor / Supervisor:</p>
              <p className="font-medium text-slate-800">
                {internship?.supervisorName || 'N/A'} ({internship?.supervisorEmail || 'N/A'})
              </p>
              <p className="text-slate-500 font-semibold mt-2">Duration & Work Mode:</p>
              <p className="font-medium text-slate-800">
                {internship?.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'} &mdash;{' '}
                {internship?.endDate ? new Date(internship.endDate).toLocaleDateString() : 'N/A'} ({internship?.location || 'Remote'})
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Objectives & Scope */}
        <section className="space-y-2 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            2. Objectives & Scope of Work
          </h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {internship?.objectives ||
              '1. Master modern full-stack web development practices using the MERN stack (MongoDB, Express, React, Node.js).\n2. Implement secure token-based user authentication and role-based access control.\n3. Develop responsive user interfaces following component design patterns.\n4. Design resilient MongoDB document schemas with compound indexing and query optimization.\n5. Prepare containerized deployment workflows and verify production security headers.'}
          </p>
        </section>

        {/* Section 3: Summary of Activities Performed */}
        <section className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            3. Summary of Activities Performed ({totalHours.toFixed(1)} Total Logged Hours)
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Hours</th>
                  <th className="p-2.5">Tasks / Deliverables Completed</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.slice(0, 10).map((act) => (
                  <tr key={act._id}>
                    <td className="p-2.5 font-medium whitespace-nowrap">
                      {new Date(act.date).toLocaleDateString()}
                    </td>
                    <td className="p-2.5 font-bold text-indigo-700">{act.hoursSpent} hrs</td>
                    <td className="p-2.5 text-slate-700 leading-snug">{act.workCompleted}</td>
                    <td className="p-2.5 font-semibold text-slate-600">{act.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activities.length > 10 && (
            <p className="text-[11px] text-slate-400 italic">
              Showing top 10 recent submissions of {activities.length} total entries.
            </p>
          )}
        </section>

        {/* Section 4: Skills & Technologies Learned */}
        <section className="space-y-2 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            4. Skills & Technologies Learned
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(allSkills).map((skill, idx) => (
              <span
                key={idx}
                className="bg-slate-100 border border-slate-300 text-slate-800 px-3 py-1 rounded-lg text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Section 5: Tasks & Project Milestones Completed */}
        <section className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            5. Milestones & Task Completion Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-500">Total Tasks:</span>
              <p className="text-xl font-black text-indigo-700 mt-1">{tasks.length}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-500">Completed:</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{completedTasks.length}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-500">Total Hours:</span>
              <p className="text-xl font-black text-teal-600 mt-1">{totalHours.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-500">Projects Tracked:</span>
              <p className="text-xl font-black text-indigo-700 mt-1">{projects.length}</p>
            </div>
          </div>
        </section>

        {/* Section 6: Results & Findings */}
        <section className="space-y-2 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            6. Results & Technical Findings
          </h2>
          <p className="text-slate-700 leading-relaxed">
            The internship engagement successfully validated full-stack architecture principles using MongoDB Atlas, Express.js middleware security pipelines, React state lifecycle models, and Tailwind responsive design. RESTful APIs were hardened against brute-force attacks via rate limiters and Helmet security headers, while ensuring rigorous data isolation through user ownership validation.
          </p>
        </section>

        {/* Section 7: Conclusion & Future Improvements */}
        <section className="space-y-2 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1.5">
            7. Conclusion & Recommendations
          </h2>
          <p className="text-slate-700 leading-relaxed">
            The student demonstrated commendable technical growth, consistency in logging daily learning outcomes, and timely completion of key project deliverables. Recommended next steps include exploring GraphQL query federation, WebSocket-based real-time peer collaborations, and automated containerized CI/CD test gates.
          </p>
        </section>

        {/* Signatures Footer */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
          <div>
            <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
            <p className="font-bold text-slate-900">{user?.name}</p>
            <p className="text-slate-500">Student Intern Signature</p>
          </div>

          <div>
            <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
            <p className="font-bold text-slate-900">{internship?.supervisorName || 'Supervisor Name'}</p>
            <p className="text-slate-500">Industry Mentor / Supervisor Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
