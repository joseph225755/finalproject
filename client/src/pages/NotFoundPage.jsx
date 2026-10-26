import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button icon={Home} size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
