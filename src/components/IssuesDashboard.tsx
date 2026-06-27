"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, FileSpreadsheet, ExternalLink, Filter, ChevronDown, Columns } from 'lucide-react';
import { useRouter } from 'next/navigation';

function MultiSelectDropdown({ 
  label, 
  options, 
  selected, 
  onChange, 
  icon: Icon,
  searchable = false
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (newSelected: string[]) => void;
  icon?: any;
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAll = selected.length === 0;
  
  const filteredOptions = searchable && searchTerm.trim() !== "" 
    ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
          !isAll ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {label} 
        {!isAll && <span className="bg-indigo-500/30 text-indigo-200 text-xs px-1.5 py-0.5 rounded-md ml-1">{selected.length}</span>}
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${label}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              <div 
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                onClick={() => { onChange([]); setIsOpen(false); }}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isAll ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-500'}`}>
                  {isAll && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="text-sm text-slate-300">All (No Filter)</span>
              </div>
              
              {filteredOptions.length === 0 && (
                 <div className="px-3 py-2 text-sm text-slate-500 text-center">
                   No matches found.
                 </div>
              )}

              {filteredOptions.map(opt => {
                const isSelected = selected.includes(opt);
                return (
                  <div 
                    key={opt}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      if (isSelected) onChange(selected.filter(s => s !== opt));
                      else onChange([...selected, opt]);
                    }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-500'}`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-sm text-slate-300">{opt}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IssuesDashboard({ csvData }: { csvData: string }) {
  const [data, setData] = useState<any[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Filters State
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [teamFilter, setTeamFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [assignTeamFilter, setAssignTeamFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string[]>([]);

  useEffect(() => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let extractedColumns: string[] = [];
        if (results.data.length > 0) {
           extractedColumns = Object.keys(results.data[0] as Record<string, unknown>).filter(k => k && k.trim() !== '' && !k.startsWith('_'));
           setAllColumns(extractedColumns);
        }

        const validData = results.data.filter((row: any) => Object.keys(row).length > 1 && row['Date']);
        setData(validData);

        setVisibleColumns(prev => {
          if (prev.length > 0) return prev;
          return extractedColumns; // By default show all columns for Issues
        });
        
        setAssignTeamFilter(prev => prev.length > 0 ? prev : ['CC']);
      }
    });
  }, [csvData]);

  // Extract unique filter options dynamically from data
  const filterOptions = useMemo(() => {
    const teams = new Set<string>();
    const statuses = new Set<string>();
    const assignTeams = new Set<string>();
    const names = new Set<string>();

    data.forEach(d => {
      if (d['Team']) teams.add(d['Team'].trim());
      if (d['Status']) statuses.add(d['Status'].trim());
      
      const at = d['Assign Name'];
      if (at && typeof at === 'string') {
        const parts = at.split('/').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
          if (p.length <= 3 && p.toUpperCase() === p) {
            assignTeams.add(p);
          } else if (p.length <= 2) {
             assignTeams.add(p.toUpperCase());
          } else {
            names.add(p);
          }
        });
      }
    });

    return {
      teams: Array.from(teams).sort(),
      statuses: Array.from(statuses).sort(),
      assignTeams: Array.from(assignTeams).sort(),
      names: Array.from(names).sort()
    };
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    let result = data;

    if (teamFilter.length > 0) {
      result = result.filter(d => {
        const t = (d['Team'] || '').trim().toLowerCase();
        return teamFilter.some(f => t === f.toLowerCase());
      });
    }

    if (statusFilter.length > 0) {
      result = result.filter(d => {
        const st = (d['Status'] || '').trim().toLowerCase();
        return statusFilter.some(f => st === f.toLowerCase());
      });
    }

    if (assignTeamFilter.length > 0 || nameFilter.length > 0) {
      result = result.filter(d => {
        const at = d['Assign Name'];
        if (!at || typeof at !== 'string') return false;
        
        const parts = at.split('/').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (parts.length === 0) return false;
        
        const rowTeams = parts.filter(p => p.length <= 3 && p.toUpperCase() === p || p.length <= 2);
        const rowNames = parts.filter(p => !(p.length <= 3 && p.toUpperCase() === p || p.length <= 2));

        const teamMatch = assignTeamFilter.length === 0 || assignTeamFilter.some(f => rowTeams.includes(f.toLowerCase()));
        const nameMatch = nameFilter.length === 0 || nameFilter.some(f => rowNames.includes(f.toLowerCase()));
        
        return teamMatch && nameMatch;
      });
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(row => 
        Object.keys(row).some(key => {
          if (key.startsWith('_')) return false;
          return String(row[key]).toLowerCase().includes(lowerQuery);
        })
      );
    }

    return result;
  }, [data, searchQuery, teamFilter, statusFilter, assignTeamFilter, nameFilter]);

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes('open')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (s.includes('close') || s.includes('done')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (s.includes('issue')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-4">
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Issues</p>
              <p className="text-2xl font-bold text-white">{filteredData.length}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-rose-500/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Open Issues</p>
              <p className="text-2xl font-bold text-white">
                {filteredData.filter(d => (d['Status'] || '').toLowerCase().includes('open')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500 backdrop-blur-md shadow-lg"
          />
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filters:</span>
        </div>
        
        <MultiSelectDropdown 
          label="Team" 
          options={filterOptions.teams} 
          selected={teamFilter} 
          onChange={setTeamFilter} 
        />
        
        <MultiSelectDropdown 
          label="Status" 
          options={filterOptions.statuses} 
          selected={statusFilter} 
          onChange={setStatusFilter} 
        />
        
        <MultiSelectDropdown 
          label="Assign Team" 
          options={filterOptions.assignTeams} 
          selected={assignTeamFilter} 
          onChange={setAssignTeamFilter} 
        />
        
        <MultiSelectDropdown 
          label="Assign Name" 
          options={filterOptions.names} 
          selected={nameFilter} 
          onChange={setNameFilter} 
          searchable={true}
        />

        <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block"></div>

        <MultiSelectDropdown 
          label="Columns" 
          icon={Columns}
          options={allColumns} 
          selected={visibleColumns} 
          onChange={setVisibleColumns} 
          searchable={true}
        />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/90 text-slate-300 font-medium border-b border-slate-700/50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c)).map(col => (
                  <th key={col} className="px-5 py-4 tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              <AnimatePresence>
                {filteredData.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="hover:bg-slate-800/60 transition-colors group"
                  >
                    {allColumns.filter(c => visibleColumns.includes(c)).map(col => {
                      const val = row[col];
                      
                      if (col.toLowerCase().includes('url') || col.toLowerCase().includes('link') || String(val).startsWith('http')) {
                        return (
                          <td key={col} className="px-5 py-3 text-slate-300">
                             {val && val !== '' ? (
                                <a href={String(val).startsWith('http') ? val : `https://${val}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-md transition-colors border border-indigo-500/20">
                                  Link <ExternalLink className="w-3 h-3" />
                                </a>
                             ) : (
                                <span className="text-slate-600">-</span>
                             )}
                          </td>
                        );
                      }

                      if (col.toLowerCase() === 'status') {
                        return (
                          <td key={col} className="px-5 py-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(val)} inline-block`}>
                              {val || 'None'}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={col} className="px-5 py-3 text-slate-300">
                          {val}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-6 py-12 text-center text-slate-500">
                    No records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
