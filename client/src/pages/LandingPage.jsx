import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Code2,
  BarChart3,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Internship Lifecycle Tracking',
      description: 'Manage employer details, supervisor contacts, objectives, and milestones in one unified dashboard.'
    },
    {
      icon: CheckCircle2,
      title: 'Kanban Task Board',
      description: 'Organize deliverables with an intuitive drag-ready Kanban board, priority badges, and due date filters.'
    },
    {
      icon: Calendar,
      title: 'Daily Activity Logs',
      description: 'Record daily hours, skills learned, obstacles encountered, and receive supervisor feedback.'
    },
    {
      icon: Layers,
      title: 'Projects & Milestones',
      description: 'Break complex full-stack applications into trackable milestones with live percentage calculation.'
    },
    {
      icon: FileCheck2,
      title: 'One-Click Progress Report',
      description: 'Generate formatted, print-ready internship reports for college evaluation and summer internship submission.'
    },
    {
      icon: ShieldCheck,
      title: 'Admin Supervision Panel',
      description: 'Faculty mentors can oversee registered students, assign placements, and moderate submitted logs.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Set Up Internship Profile',
      desc: 'Enter your company, supervisor information, start/end dates, and educational learning objectives.'
    },
    {
      step: '02',
      title: 'Manage Tasks & Daily Work',
      desc: 'Create tasks, assign priorities, and log daily hours worked alongside skills acquired.'
    },
    {
      step: '03',
      title: 'Track Milestones & Proofs',
      desc: 'Link GitHub repos, live demos, and upload project documentation to substantiate your progress.'
    },
    {
      step: '04',
      title: 'Export Evaluation Report',
      desc: 'Generate a print-ready PDF progress report ready for academic evaluation and credit submission.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              IT
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              Intern<span className="text-indigo-600">Track</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" icon={Sparkles}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>MERN Stack Student Internship & Project Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Streamline College Internships with <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Precision & Ease</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            InternTrack equips students and academic mentors with an end-to-end portal for managing daily work logs, project milestones, tasks, and printable internship evaluation reports.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-lg shadow-indigo-600/20" icon={ArrowRight}>
                Start Your Internship Portal
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Demo Credentials Sign In
              </Button>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
            <div className="p-3 text-center border-r border-slate-100 last:border-none">
              <p className="text-2xl font-black text-indigo-600">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">MERN Architecture</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-none">
              <p className="text-2xl font-black text-teal-600">JWT & RBAC</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Secure Authentication</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-none">
              <p className="text-2xl font-black text-indigo-600">Print-to-PDF</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Evaluation Reports</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl font-black text-teal-600">Atlas</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">MongoDB Cloud Store</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Built For Success</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything Needed for College Internship Documentation
            </p>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Designed according to college development internship guidelines, with robust database persistence and security headers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-soft transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Standard Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              How InternTrack Empowers Your Internship Journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative">
                <span className="text-3xl font-black text-indigo-100 block mb-3">{s.step}</span>
                <h4 className="font-bold text-slate-900 text-base mb-2">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Ready to Manage Your Internship Like a Professional?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
            Create your account today or log in with demo credentials to explore the interactive dashboard and task management portal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">
                Explore Demo Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-slate-950 py-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>InternTrack &copy; {new Date().getFullYear()} — Student Internship & Project Management Portal</p>
      </footer>
    </div>
  );
};
