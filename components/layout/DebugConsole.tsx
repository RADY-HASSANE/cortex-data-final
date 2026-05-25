
import React from 'react';
import { useDebug, DebugLog } from '../../context/DebugContext';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244 2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const DebugConsole: React.FC = () => {
  const { isDebugOpen, toggleDebug, logs, clearLogs } = useDebug();

  if (!isDebugOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 h-2/3 md:h-1/2 bg-[#1e1e1e] text-gray-300 shadow-2xl z-50 flex flex-col border-t-2 border-brand-500 font-mono text-xs md:text-sm animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="font-bold text-white tracking-wider">N8N DEBUGGER</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#333] text-[10px] text-gray-400">{logs.length} logs</span>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={clearLogs}
                className="p-1.5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded transition-colors mr-2"
                title="Clear Logs"
            >
                <TrashIcon />
            </button>
            <button 
                onClick={toggleDebug}
                className="p-1.5 hover:bg-[#333] rounded transition-colors text-white"
            >
                <CloseIcon />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                <p>No requests captured yet.</p>
                <p className="text-xs">Send a message to see the payload.</p>
            </div>
        ) : (
            logs.map((log) => (
                <div key={log.id} className="flex flex-col md:flex-row gap-4 border-b border-[#333] pb-6 last:border-0">
                    {/* Meta */}
                    <div className="w-full md:w-32 flex-shrink-0 flex flex-row md:flex-col justify-between md:justify-start gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold w-fit ${log.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {log.type === 'success' ? '200 OK' : 'ERROR'}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                    </div>

                    {/* Payloads */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-blue-400 font-semibold">Request (To n8n)</span>
                            <pre className="bg-[#111] p-3 rounded border border-[#333] overflow-x-auto text-blue-100">
                                <code>{JSON.stringify(log.request, null, 2)}</code>
                            </pre>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-green-400 font-semibold">Response (From n8n)</span>
                            <pre className="bg-[#111] p-3 rounded border border-[#333] overflow-x-auto text-green-100">
                                <code>{typeof log.response === 'string' ? log.response : JSON.stringify(log.response, null, 2)}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
