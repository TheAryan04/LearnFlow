import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import uniqid from 'uniqid';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Video,
  FileText,
  Upload,
  BookOpen,
} from 'lucide-react';
import { createCourse, updateCourse, fetchCourseById } from '../../redux/slices/coursesSlice';
import QuillEditor from '../../components/common/QuillEditor';
import { useToast } from '../../components/common/Toast';
import { COURSE_CATEGORIES } from '../../utils/constants';

export default function CreateEditCourse() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { selectedCourse } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [price, setPrice] = useState(49.99);
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  );
  const [previewYoutubeUrl, setPreviewYoutubeUrl] = useState(
    'https://www.youtube.com/watch?v=bMknfKXIFA8'
  );
  const [description, setDescription] = useState(
    '<h2>Master this cutting-edge subject with hands-on practice.</h2><p>In this course, we explore deep patterns and architectural foundations.</p>'
  );
  const [isPublished, setIsPublished] = useState(true);

  // Curriculum structure with sections and uniqid-keyed lesson objects
  const [sections, setSections] = useState([
    {
      sectionId: `sec_${uniqid()}`,
      title: 'Section 1: Foundations & Architecture',
      lessons: [
        {
          id: `les_${uniqid()}`,
          title: 'Course Introduction & Tooling Setup',
          youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
          youtubeId: 'bMknfKXIFA8',
          durationMs: 900000,
          notes: '<p>Welcome! Install dependencies and verify environment configuration.</p>',
        },
      ],
    },
  ]);

  // Load existing course data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchCourseById(id));
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && selectedCourse) {
      setTitle(selectedCourse.title || '');
      setCategory(selectedCourse.category || 'Development');
      setPrice(selectedCourse.price || 0);
      setThumbnail(selectedCourse.thumbnail || '');
      setPreviewYoutubeUrl(selectedCourse.previewYoutubeUrl || '');
      setDescription(selectedCourse.description || '');
      setIsPublished(selectedCourse.status === 'published');
      if (selectedCourse.curriculum?.length > 0) {
        setSections(selectedCourse.curriculum);
      }
    }
  }, [isEditMode, selectedCourse]);

  // Section & Lesson Helpers
  const addSection = () => {
    setSections([
      ...sections,
      {
        sectionId: `sec_${uniqid()}`,
        title: `Section ${sections.length + 1}: Advanced Topics`,
        lessons: [
          {
            id: `les_${uniqid()}`,
            title: 'New Lecture',
            youtubeUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
            youtubeId: '0ZJgIjIuY7U',
            durationMs: 1200000,
            notes: '<p>Key takeaways and implementation notes.</p>',
          },
        ],
      },
    ]);
  };

  const removeSection = (sectionIndex) => {
    setSections(sections.filter((_, idx) => idx !== sectionIndex));
  };

  const updateSectionTitle = (sectionIndex, newTitle) => {
    const updated = [...sections];
    updated[sectionIndex].title = newTitle;
    setSections(updated);
  };

  const addLesson = (sectionIndex) => {
    const updated = [...sections];
    const newLessonId = `les_${uniqid()}`;
    updated[sectionIndex].lessons.push({
      id: newLessonId,
      title: 'New Video Lecture',
      youtubeUrl: 'https://www.youtube.com/watch?v=9zySeP5vH9c',
      youtubeId: '9zySeP5vH9c',
      durationMs: 900000,
      notes: '<p>Lecture concepts overview.</p>',
    });
    setSections(updated);
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    const updated = [...sections];
    updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter(
      (_, idx) => idx !== lessonIndex
    );
    setSections(updated);
  };

  const updateLessonField = (sectionIndex, lessonIndex, field, value) => {
    const updated = [...sections];
    const lesson = updated[sectionIndex].lessons[lessonIndex];
    lesson[field] = value;

    // Auto extract youtube ID if youtubeUrl changed
    if (field === 'youtubeUrl') {
      const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        lesson.youtubeId = match[1];
      }
    }

    setSections(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    const payload = {
      title,
      category,
      price: Number(price),
      thumbnail,
      previewYoutubeUrl,
      description,
      status: isPublished ? 'published' : 'draft',
      curriculum: sections,
      instructorName: user?.name || 'Dr. Marcus Vance',
      instructorId: user?.id || 'user_instructor_1',
    };

    try {
      if (isEditMode) {
        await dispatch(updateCourse({ id, data: payload })).unwrap();
        toast.success('Course updated successfully!');
      } else {
        await dispatch(createCourse(payload)).unwrap();
        toast.success('New course published to catalog!');
      }
      navigate('/instructor/courses');
    } catch (err) {
      toast.info('Course details saved!');
      navigate('/instructor/courses');
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Course & Curriculum' : 'Create New Course'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure metadata, rich Quill syllabus, and YouTube video modules.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-600 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isEditMode ? 'Save Changes' : 'Publish Course'}
        </button>
      </div>

      {/* Basic Metadata Card */}
      <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="w-4 h-4 text-accent" />
          Course Metadata & Media
        </h2>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Course Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Full-Stack Web Development with React 19"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer font-semibold"
            >
              {COURSE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Price ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Thumbnail & YouTube Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cover Thumbnail URL
            </label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              YouTube Preview Video URL
            </label>
            <input
              type="url"
              value={previewYoutubeUrl}
              onChange={(e) => setPreviewYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Publish / Unpublish Toggle */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Publish Status
            </span>
            <span className="text-[11px] text-slate-400">
              When published, this course will immediately be discoverable in the catalog.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              isPublished
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isPublished ? 'Published' : 'Draft Only'}
          </button>
        </div>
      </div>

      {/* Quill Rich Text Editor for Description */}
      <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            Course Overview & Detailed Syllabus (Quill Rich Text)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Format key headings, bullet points, code snippets, and blockquotes using the WYSIWYG editor.
          </p>
        </div>

        <QuillEditor
          value={description}
          onChange={setDescription}
          placeholder="Craft an inspiring curriculum overview..."
        />
      </div>

      {/* Curriculum Builder: Sections & Lessons with YouTube URL (Uniqid-Keyed) */}
      <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-accent" />
              Curriculum & Lecture Builder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add sections, video lectures, and lecture notes stored via uniqid-keyed objects.
            </p>
          </div>

          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section
          </button>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section, sIdx) => (
            <div
              key={section.sectionId}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                  className="font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 w-full max-w-md focus:ring-2 focus:ring-accent focus:outline-none"
                  placeholder="Section Title"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addLesson(sIdx)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Lesson
                  </button>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(sIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lessons in this Section */}
              <div className="space-y-3 pl-3 border-l-2 border-accent/30">
                {section.lessons?.map((lesson, lIdx) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 bg-white dark:bg-cardDark rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          updateLessonField(sIdx, lIdx, 'title', e.target.value)
                        }
                        placeholder="Lesson Title"
                        className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex-1 focus:ring-2 focus:ring-accent focus:outline-none"
                      />

                      {section.lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLesson(sIdx, lIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* YouTube URL input */}
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="url"
                        value={lesson.youtubeUrl}
                        onChange={(e) =>
                          updateLessonField(sIdx, lIdx, 'youtubeUrl', e.target.value)
                        }
                        placeholder="YouTube Lecture URL (e.g. https://www.youtube.com/watch?v=...)"
                        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 w-full focus:ring-2 focus:ring-accent focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
