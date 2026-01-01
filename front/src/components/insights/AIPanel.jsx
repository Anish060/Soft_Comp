import React, { useState } from 'react';
import { 
  Zap, 
  Target, 
  Flame, 
  BarChart3, 
  Edit3, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useResumeStore from '../../store/useResumeStore';
import { cn } from '../../utils/cn';
import PeerComparisonChart from '../charts/PeerComparisonChart';
import { useAIService } from '../../services/aiService';

const Sparkles = ({ className, size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);


const AIPanel = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const { analysis, isAnalyzing, file } = useResumeStore();
  const { analyzeResume } = useAIService();

  const tabs = [
    { id: 'insights', label: 'Insights', icon: <Zap size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Edit3 size={18} /> },
    { id: 'heatmap', label: 'Heatmap', icon: <Flame size={18} /> },
    { id: 'comparison', label: 'Peer View', icon: <BarChart3 size={18} /> },
    { id: 'cover', label: 'Cover Letter', icon: <FileText size={18} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          AI Intelligence <div className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Beta</div>
        </h2>
        <p className="text-sm text-slate-500 mt-1">Real-time resume optimization and impact analysis.</p>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all relative whitespace-nowrap",
              activeTab === tab.id 
                ? 'text-blue-600 bg-blue-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {analysis && console.log('🔍 Current Analysis State:', analysis)}
        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing ? (
            <EmptyState onTryMock={() => analyzeResume(null, true)} onAnalyze={() => analyzeResume()} hasFile={!!file} />
          ) : isAnalyzing ? (
            <LoadingState />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'insights' && <InsightsView data={analysis} />}
              {activeTab === 'editor' && <EditorView data={analysis} />}
              {activeTab === 'heatmap' && <HeatmapView data={analysis} />}
              {activeTab === 'comparison' && <ComparisonView data={analysis} />}
              {activeTab === 'cover' && <CoverLetterView data={analysis} />}
              
              {/* Error/Raw Logic */}
              {(analysis?.error || analysis?.raw) && (
                <div className="mt-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-500 mb-2 font-bold text-xs">
                    <AlertTriangle size={14} />
                    <span>AI Model Feedback</span>
                  </div>
                  {analysis?.error && <p className="text-xs text-red-600 mb-4">{analysis.error}</p>}
                  {analysis?.raw && (
                    <div className="bg-slate-900 rounded-xl p-3">
                       <p className="text-[10px] text-slate-400 font-mono break-all">{analysis.raw}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Sticky Action Bar */}
      {analysis && (
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
          <div className="flex gap-2">
            <button className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              Apply Optimized Changes
            </button>
            <button className="px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ onTryMock, onAnalyze, hasFile }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
      <Zap className="text-slate-200" size={32} />
    </div>
    <h3 className="text-slate-700 font-semibold mb-2">Ready to Optimize?</h3>
    <p className="text-sm text-slate-400 mb-8">
      {hasFile 
        ? "Your resume is uploaded. Click below to start the deep intelligence analysis."
        : "Upload your resume in the left panel to unlock AI insights and suggestions."}
    </p>
    
    <div className="flex flex-col w-full gap-3">
      {hasFile && (
        <button 
          onClick={onAnalyze}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          <Zap size={18} fill="currentColor" />
          Run Full Intelligence Analysis
        </button>
       )}
       <button 
         onClick={onTryMock}
         className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
       >
         <FileText size={18} />
         Try with Example Data
       </button>
    </div>
  </div>
);


const LoadingState = () => (
  <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
      <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
    </div>
    <div className="text-center">
      <p className="text-slate-700 font-bold text-lg">Thinking...</p>
      <p className="text-sm text-slate-400 mt-1 max-w-[200px]">Extracting role-agnostic skills and detecting bias patterns</p>
    </div>
  </div>
);

// --- Sub-Views ---

const InsightsView = ({ data }) => (
  <div className="space-y-8">
    <div>
      <SectionTitle title="Probable Roles" />
      <div className="flex flex-wrap gap-2 mt-3">
        {data.roles?.length > 0 ? data.roles.map((role, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Target size={14} className="text-blue-400" />
              {role.title}
            </span>
            <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg self-start">
              {role.match}
            </div>
          </div>
        )) : (
          <p className="text-xs text-slate-400 italic">No role inferences found in this scan.</p>
        )}
      </div>
    </div>

    <div>
      <SectionTitle title="Skill Gaps" />
      <div className="space-y-3 mt-3">
        {data.skill_gaps?.length > 0 ? data.skill_gaps.map((gap, i) => (
          <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 group hover:border-amber-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-amber-900">{gap.skill}</p>
                  <span className="text-[10px] bg-amber-200/50 px-1.5 py-0.5 rounded text-amber-700 uppercase font-black">{gap.importance}</span>
                </div>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{gap.reason}</p>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-xs text-slate-400 italic">No major skill gaps detected for current experience level.</p>
        )}
      </div>
    </div>

    <div>
      <SectionTitle title="Soft Skills & Impact" />
      <div className="grid grid-cols-2 gap-3 mt-3">
        {data.soft_skills?.map((ss, i) => (
          <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{ss.skill}</span>
              <CheckCircle2 size={14} className="text-green-500" />
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2">{ss.evidence}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EditorView = ({ data }) => (
  <div className="space-y-6">
    <SectionTitle title="Live AI Reasoning" />
    <div className="space-y-4 mt-3">
      {data.line_suggestions?.length > 0 ? data.line_suggestions.map((s, i) => (
        <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm group">
          <div className="p-3 bg-red-50/50 border-b border-red-50 flex items-center gap-2">
            <X size={14} className="text-red-400" />
            <p className="text-xs text-red-700 line-through truncate">{s.original}</p>
          </div>
          <div className="p-4 bg-green-50/30">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-slate-800 leading-tight">{s.rewrite}</p>
            </div>
            <div className="bg-white/60 p-2 rounded-lg border border-green-100/50 mb-4">
              <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                <Info size={12} className="text-slate-400" />
                {s.reason}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                Accept
              </button>
              <button className="px-3 border border-slate-200 text-xs py-2 rounded-lg hover:bg-slate-50 font-medium">
                Reject
              </button>
            </div>
          </div>
        </div>
      )) : (
        <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
           <p className="text-xs text-slate-400 italic">No line rewriting suggestions available for this section.</p>
        </div>
      )}
    </div>
    
    <div>
      <SectionTitle title="Bias & Redundancy" />
      <div className="space-y-2">
        {data.biases?.map((b, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
            <div>
              <p className="text-xs font-bold text-slate-700">"{b.word}"</p>
              <p className="text-[10px] text-slate-400">Type: {b.type}</p>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className="text-right">
              <p className="text-xs font-bold text-blue-600">{b.suggestion}</p>
              <p className="text-[10px] text-blue-400">Neutral Alternative</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeatmapView = ({ data }) => (
  <div className="space-y-6">
    <SectionTitle title="Recruiter Focus zones" />
    <div className="space-y-4 mt-3">
      {data.heatmap?.length > 0 ? data.heatmap.map((h, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>{h.section}</span>
            <span>{Math.round(h.weight * 100)}% attention</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${h.weight * 100}%` }}
               className={cn(
                 "h-full rounded-full transition-all duration-1000",
                 h.weight > 0.8 ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-blue-500"
               )} 
            />
          </div>
        </div>
      )) : (
        <p className="text-xs text-slate-400 italic">No heatmap projections available for this layout.</p>
      )}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">

         <div className="flex items-center gap-2 mb-2">
           <Flame size={16} className="text-orange-500" />
           <p className="text-xs font-bold text-blue-900">Intensity Legend</p>
         </div>
         <p className="text-[11px] text-blue-700 leading-relaxed">
           Red zones indicate "F-pattern" hotspots where recruiters spend 70% of their viewing time (usually top-left and headings).
         </p>
      </div>
    </div>
  </div>
);

const ComparisonView = () => (
  <div className="space-y-6">
    <SectionTitle title="You vs Market Peers" />
    <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 flex items-center justify-center">
       <PeerComparisonChart />
    </div>
    <div className="grid grid-cols-2 gap-3">
       <MetricCard label="Skill Density" val="+12%" sub="Above peer avg" color="green" />
       <MetricCard label="Impact depth" val="Strong" sub="Needs more data" color="blue" />
    </div>
  </div>
);


const MetricCard = ({ label, val, sub, color }) => (
  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{label}</p>
    <p className={cn("text-xl font-black", color === 'green' ? 'text-green-600' : 'text-blue-600')}>{val}</p>
    <p className="text-[10px] text-slate-500 mt-1 italic">{sub}</p>
  </div>
);

const CoverLetterView = () => (
  <div className="space-y-6">
    <SectionTitle title="Tone Selection" />
    <div className="grid grid-cols-2 gap-2 mt-3">
       {['Formal', 'Startup', 'Research', 'Creative'].map(tone => (
         <button key={tone} className="p-3 text-xs font-bold border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
           {tone}
         </button>
       ))}
    </div>
    <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-200">
      <Sparkles size={16} className="text-blue-400" />
      Generate Tailored Draft
    </button>
  </div>
);

const SectionTitle = ({ title }) => (
  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{title}</h4>
);


export default AIPanel;
