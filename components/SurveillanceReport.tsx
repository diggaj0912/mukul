import React from 'react';
import { CareVisionReport, AppStatus, EmotionEvent } from '../types';
import { ReportIcon, SpinnerIcon, WarningIcon, CheckCircleIcon, TimelineIcon } from './IconComponents';

interface CareVisionReportDisplayProps {
  status: AppStatus;
  report: CareVisionReport | null;
  error: string | null;
  history: EmotionEvent[];
  isProcessing: boolean;
}

const getAlertColor = (level: CareVisionReport['alertStatus']) => {
  if (level === 'Alert Triggered') {
    return 'border-red-500 bg-red-900/50 text-red-300';
  }
  return 'border-green-500 bg-green-900/50 text-green-300';
};

const ReportContent: React.FC<{ report: CareVisionReport }> = ({ report }) => (
  <>
    <div className={`p-4 rounded-lg mb-4 border ${getAlertColor(report.alertStatus)}`}>
      <h4 className="font-bold text-lg mb-1">{report.alertStatus === 'Alert Triggered' ? 'ALERT TRIGGERED' : 'Status: Normal'}</h4>
      <p className="text-sm">{report.recommendation}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-center">
        <div className="bg-black/20 p-3 rounded-lg">
            <h5 className="text-sm font-semibold text-cyan-400 uppercase">Emotion</h5>
            <p className="text-lg font-bold">{report.emotion}</p>
        </div>
        <div className="bg-black/20 p-3 rounded-lg">
            <h5 className="text-sm font-semibold text-cyan-400 uppercase">Motion</h5>
            <p className="text-lg font-bold">{report.motion}</p>
        </div>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Summary</h4>
      <p className="text-gray-300 text-sm leading-relaxed">{report.summary}</p>
    </div>
  </>
);

const Timeline: React.FC<{ history: EmotionEvent[] }> = ({ history }) => (
    <div className="mt-6 border-t border-cyan-500/20 pt-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-400 mb-3">
            <TimelineIcon />
            <span>Event Timeline</span>
        </h3>
        <div className="space-y-2 text-xs text-gray-400">
            {history.length > 0 ? history.map((event, index) => (
                <div key={index} className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span>{event.timestamp}</span>
                    <span className="font-semibold">{event.emotion} / {event.motion}</span>
                    <span className="italic truncate w-1/3 text-right">"{event.summary}"</span>
                </div>
            )) : <p className="text-gray-500">No events recorded yet.</p>}
        </div>
    </div>
);


export const CareVisionReportDisplay: React.FC<CareVisionReportDisplayProps> = ({ status, report, error, history, isProcessing }) => {
  const renderContent = () => {
    switch (status) {
      case AppStatus.MONITORING:
        if (isProcessing && !report) { // First analysis
             return (
              <div className="flex flex-col items-center justify-center h-full text-cyan-400">
                <SpinnerIcon className="w-12 h-12" />
                <p className="mt-4 text-lg font-semibold">INITIALIZING ANALYSIS...</p>
                <p className="text-sm text-cyan-600">Acquiring first reading from the live feed.</p>
              </div>
            );
        }
        if (report) {
          return <ReportContent report={report} />;
        }
        return null;
      case AppStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <WarningIcon className="w-12 h-12" />
            <p className="mt-4 text-lg font-semibold">Monitoring Failed</p>
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        );
      case AppStatus.IDLE:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ReportIcon className="w-12 h-12" />
            <p className="mt-4 text-lg font-semibold">System Idle</p>
            <p className="text-sm text-center">Start monitoring to begin patient analysis and receive alerts.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm h-full flex flex-col">
      <h2 className="flex items-center justify-between gap-3 text-2xl font-semibold text-cyan-400 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {status === AppStatus.MONITORING && report ? <CheckCircleIcon /> : <ReportIcon />}
          <span>Analysis Report</span>
        </div>
        {isProcessing && status === AppStatus.MONITORING && <SpinnerIcon className="w-6 h-6 text-cyan-400" />}
      </h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {renderContent()}
        {(status === AppStatus.MONITORING || history.length > 0) && <Timeline history={history} />}
      </div>
    </div>
  );
};