"use client";

import { useState } from 'react';
import Dashboard from './Dashboard';
import IssuesDashboard from './IssuesDashboard';
import { LayoutDashboard, AlertCircle } from 'lucide-react';

export default function MainDashboard({ 
  csvDataOrders, 
  csvDataIssues 
}: { 
  csvDataOrders: string, 
  csvDataIssues: string 
}) {
  const [activeTab, setActiveTab] = useState<'orders' | 'issues'>('orders');

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-800/50 p-1 rounded-2xl w-full md:w-fit border border-slate-700/50 shadow-lg">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium text-sm w-1/2 md:w-auto justify-center ${
            activeTab === 'orders' 
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Orders Tracker
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium text-sm w-1/2 md:w-auto justify-center ${
            activeTab === 'issues' 
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Project Issues
        </button>
      </div>

      {activeTab === 'orders' ? (
        <Dashboard csvData={csvDataOrders} />
      ) : (
        <IssuesDashboard csvData={csvDataIssues} />
      )}
    </div>
  );
}
