import React, { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonPage } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  FileCheck2,
  FileSpreadsheet,
  FileCode,
  File,
  Search,
  ExternalLink
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Project Documentation',
    description: '',
    file: null,
    fileUrl: ''
  });

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: search.trim() || undefined
      };
      const res = await documentService.getDocuments(params);
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to fetch documents.'));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('File size must be under 10MB.');
        return;
      }
      setUploadForm((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadForm.title.trim()) {
      toast.warning('Document title is required.');
      return;
    }
    if (!uploadForm.file && !uploadForm.fileUrl.trim()) {
      toast.warning('Please select a file to upload or provide a resource link.');
      return;
    }

    setIsUploading(true);
    try {
      if (uploadForm.file) {
        const formData = new FormData();
        formData.append('title', uploadForm.title);
        formData.append('category', uploadForm.category);
        formData.append('description', uploadForm.description);
        formData.append('file', uploadForm.file);
        const res = await documentService.uploadDocument(formData);
        toast.success('Document uploaded successfully!');
        setDocuments((prev) => [res.document, ...prev]);
      } else {
        const res = await documentService.uploadDocument({
          title: uploadForm.title,
          category: uploadForm.category,
          description: uploadForm.description,
          fileUrl: uploadForm.fileUrl,
          fileName: uploadForm.title + '.pdf',
          fileType: 'application/pdf'
        });
        toast.success('Resource document attached!');
        setDocuments((prev) => [res.document, ...prev]);
      }

      setIsUploadModalOpen(false);
      setUploadForm({
        title: '',
        category: 'Project Documentation',
        description: '',
        file: null,
        fileUrl: ''
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to upload document.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(docToDelete._id);
      toast.success('Document deleted successfully!');
      setDocuments((prev) => prev.filter((d) => d._id !== docToDelete._id));
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete document.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Documents & Resources
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Store offer letters, weekly summaries, project specifications, and evaluation forms
          </p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)} icon={Upload} size="sm">
          Upload Document
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or file name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
        >
          <option value="All">All Categories</option>
          <option value="Offer Letter">Offer Letter</option>
          <option value="Weekly Report">Weekly Report</option>
          <option value="Certificate">Certificate</option>
          <option value="Project Documentation">Project Documentation</option>
          <option value="Evaluation Sheet">Evaluation Sheet</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading ? (
        <SkeletonPage />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Documents Uploaded"
          description="Upload your internship offer letter, architecture specs, or evaluation attachments to store them securely."
          actionText="Upload First Document"
          actionIcon={Upload}
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {doc.category}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h4>
                {doc.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                )}

                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="truncate max-w-[150px]">{doc.fileName}</span>
                  <span>&bull;</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={doc.fileName}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / View
                </a>

                <button
                  onClick={() => {
                    setDocToDelete(doc);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload or Attach Document"
        subtitle="Max file size 10MB (PDF, DOCX, PNG, JPG, TXT)"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            placeholder="e.g. Official Internship Offer Letter"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Offer Letter">Offer Letter</option>
              <option value="Weekly Report">Weekly Report</option>
              <option value="Certificate">Certificate</option>
              <option value="Project Documentation">Project Documentation</option>
              <option value="Evaluation Sheet">Evaluation Sheet</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select File to Upload
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div className="text-center text-xs text-slate-400 font-medium my-1">— OR —</div>

          <Input
            label="Document Resource URL / Cloud Drive Link"
            type="url"
            value={uploadForm.fileUrl}
            onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
            placeholder="https://drive.google.com/file/..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows="2"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Brief context or comments about this file..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${docToDelete?.title}"?`}
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
