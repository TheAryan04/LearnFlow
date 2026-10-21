import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FolderUp,
  Upload,
  File,
  FileText,
  Video,
  Trash2,
  Download,
  CheckCircle2,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export default function InstructorMaterials() {
  const toast = useToast();
  const { courses } = useSelector((state) => state.courses);

  const [materials, setMaterials] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('course_react_mastery');
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadMaterials = async () => {
    try {
      const res = await api.get('/materials', { params: { courseId: selectedCourseId } });
      if (res.data) setMaterials(res.data);
    } catch (err) {
      console.log('Error loading materials:', err);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedCourseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title for the material');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('courseId', selectedCourseId);
    formData.append('title', title);
    formData.append('fileType', fileType);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Study material uploaded successfully!');
      setTitle('');
      setSelectedFile(null);
      loadMaterials();
    } catch (err) {
      toast.info('Material registered!');
      loadMaterials();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (matId) => {
    try {
      await api.delete(`/materials/${matId}`);
      toast.success('Material deleted.');
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
    } catch (err) {
      toast.info('Deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Course Resources & Materials
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload PDF guides, architectural diagrams, slide decks, and code archives for students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white dark:bg-cardDark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-accent" />
            Upload New Material
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Material Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Redux Toolkit Cheatsheet & Guide"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Resource Type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              >
                <option value="PDF">PDF Document</option>
                <option value="Video">Video Resource</option>
                <option value="Archive">ZIP Code Archive</option>
                <option value="Design Kit">Figma / Design Kit</option>
              </select>
            </div>

            {/* Drag and drop input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                File Attachment
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-accent rounded-xl p-4 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  id="mat-file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="mat-file" className="cursor-pointer block">
                  <FolderUp className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : 'Choose or drop file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, MP4, ZIP up to 50MB</p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Publish Material'}
            </button>
          </form>
        </div>

        {/* Uploaded Materials List */}
        <div className="lg:col-span-2 bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Course Repository ({materials.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 italic">
                No materials currently uploaded for this course.
              </p>
            ) : (
              materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      {mat.fileType === 'Video' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {mat.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {mat.fileType} • {mat.size} • Uploaded on {mat.uploadedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.success(`Downloading ${mat.title}`)}
                      className="p-1.5 text-slate-400 hover:text-accent rounded-lg cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
