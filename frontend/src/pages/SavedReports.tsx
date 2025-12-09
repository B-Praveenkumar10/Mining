import React, { useState } from 'react';
import { FileText, Download, Trash2, Calendar, Clock, Loader2 } from 'lucide-react';
import { useSavedReports, SavedReport } from '../contexts/SavedReportsContext';
import { downloadReport } from '../services/api';

const SavedReports: React.FC = () => {
  const { savedReports, deleteReport } = useSavedReports();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (report: SavedReport) => {
    setDownloadingId(report.id);
    try {
      await downloadReport(report.dateRange.startDate, report.dateRange.endDate);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteReport(id);
      setDeletingId(null);
    }, 300);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'All available data';
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="h-full bg-neutral-50 dark:bg-neutral-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Saved Reports</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            View and download your saved analytics reports
          </p>
        </div>

        {savedReports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              No saved reports yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              Ask the AI Assistant to generate a report and click "Save Report" to keep it here for later access.
            </p>
          </div>
        ) : (
          /* Reports List */
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm transition-all ${
                  deletingId === report.id ? 'opacity-50 scale-98' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                        {report.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateRange(report.dateRange.startDate, report.dateRange.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Saved {formatDate(report.createdAt)}
                        </span>
                      </div>
                      {report.summary && (
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {report.summary.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={downloadingId === report.id}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === report.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                      className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedReports;
