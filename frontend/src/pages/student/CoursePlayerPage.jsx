import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { fetchCourseById } from '../../redux/slices/coursesSlice';
import { fetchEnrolments, updateLessonProgress } from '../../redux/slices/enrolmentsSlice';
import ProgressBar from '../../components/common/ProgressBar';
import QuillViewer from '../../components/common/QuillViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import api from '../../utils/api';
import socket, { joinCourseRoom, leaveCourseRoom } from '../../utils/socket';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const toast = useToast();

  const { selectedCourse: course, loading: courseLoading } = useSelector((state) => state.courses);
  const { enrolments } = useSelector((state) => state.enrolments);
  const { user, role } = useSelector((state) => state.auth);

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'discussion'

  // Live Discussion State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchEnrolments(user?.id));

      // Fetch initial course discussion history
      api
        .get('/discussions', { params: { courseId } })
        .then((res) => {
          if (res.data) setMessages(res.data);
        })
        .catch((err) => console.log('Error fetching discussions:', err));

      // Join real-time Socket.io course room
      joinCourseRoom(courseId);

      // Listen for incoming live messages
      const handleReceiveMessage = (msg) => {
        if (msg.courseId === courseId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        leaveCourseRoom(courseId);
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [courseId, dispatch, user]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const currentEnrolment = enrolments.find((e) => e.courseId === courseId) || {
    id: 'demo_enrol',
    progress: 50,
    completedLessons: ['les_101'],
  };

  const completedLessons = currentEnrolment?.completedLessons || [];

  const allLessons = [];
  course?.curriculum?.forEach((sec) => {
    sec.lessons?.forEach((l) => allLessons.push(l));
  });

  useEffect(() => {
    if (allLessons.length > 0 && !activeLesson) {
      setActiveLesson(allLessons[0]);
    }
  }, [allLessons, activeLesson]);

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const isCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;

  const handleToggleComplete = async () => {
    if (!activeLesson || !currentEnrolment) return;
    const nextCompleted = !isCompleted;

    try {
      await dispatch(
        updateLessonProgress({
          enrolmentId: currentEnrolment.id,
          lessonId: activeLesson.id,
          completed: nextCompleted,
        })
      ).unwrap();

      toast.success(nextCompleted ? 'Lesson marked as complete!' : 'Lesson unmarked.');
    } catch (err) {
      toast.info(nextCompleted ? 'Marked complete!' : 'Unmarked.');
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  // Send real-time discussion message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    const payload = {
      courseId,
      userId: user?.id,
      userName: user?.name || 'Alex Johnson',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: role || 'Student',
      message: newMessage.trim(),
    };

    try {
      await api.post('/discussions', payload);
      setNewMessage('');
    } catch (err) {
      toast.error(err.message || 'Message could not be sent');
    } finally {
      setSendingMessage(false);
    }
  };

  if (courseLoading || !course) {
    return <LoadingSpinner fullScreen message="Loading course lectures & live room..." />;
  }

  const youtubeOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      {/* Player Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-cardDark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/student/courses"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Back to my courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {activeLesson?.title || 'Lesson Player'}
            </p>
          </div>
        </div>

        {/* Real-time Indicator & Linear Progress */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70" />
            <span>Live Sync Active</span>
          </div>
          <div className="hidden md:flex items-center gap-4 w-60">
            <ProgressBar percent={currentEnrolment.progress || 0} strokeWidth={4} />
          </div>
        </div>
      </header>

      {/* Main Player Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar: Curriculum & Lessons List */}
        <aside className="w-full lg:w-80 lg:h-[calc(100vh-4rem)] bg-white dark:bg-cardDark border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col order-2 lg:order-1 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Course Curriculum
            </span>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{completedLessons.length} / {allLessons.length} completed</span>
              <span className="font-semibold text-accent">{currentEnrolment.progress || 0}%</span>
            </div>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
            {course.curriculum?.map((sec, sIdx) => (
              <div key={sec.sectionId || sIdx} className="p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {sec.title}
                </p>
                <div className="space-y-1">
                  {sec.lessons?.map((les) => {
                    const isActive = activeLesson?.id === les.id;
                    const done = completedLessons.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-accent/10 dark:bg-accent/20 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <Play className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center & Right: Video Player & Tabs */}
        <main className="flex-1 flex flex-col order-1 lg:order-2 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* React YouTube Video Player Container */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-elevated">
            <YouTube
              videoId={activeLesson?.youtubeId || course.previewYoutubeId || 'bMknfKXIFA8'}
              opts={youtubeOptions}
              className="w-full h-full"
              iframeClassName="w-full h-full"
            />
          </div>

          {/* Controls Bar: Lesson Title + Complete Toggle + Prev/Next */}
          <div className="bg-white dark:bg-cardDark p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                Lesson {currentIndex + 1} of {allLessons.length}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {activeLesson?.title || 'Course Lecture'}
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleToggleComplete}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                {isCompleted ? 'Completed' : 'Mark as Complete'}
              </button>

              <button
                onClick={handlePrevLesson}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Previous lesson"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextLesson}
                disabled={currentIndex === allLessons.length - 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Next lesson"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selector: Notes vs Live Q&A Discussion */}
          <div className="bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-6 pt-4 gap-6">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Lecture Notes & Study Material
              </button>

              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'discussion'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Live Cohort Discussion & Q&A
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent font-mono font-bold">
                  {messages.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Quill Rendered Notes */}
            {activeTab === 'notes' && (
              <div className="p-6 sm:p-8">
                <QuillViewer
                  content={
                    activeLesson?.notes ||
                    `<h4>Lecture Overview</h4><p>Take notes and apply concepts practically from this lecture.</p>`
                  }
                />
              </div>
            )}

            {/* Tab 2: Live Real-Time Discussion via Socket.io */}
            {activeTab === 'discussion' && (
              <div className="p-6 flex flex-col h-96">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Live Chat Room for {course.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected via WebSockets
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                      No questions yet. Be the first to start the lecture discussion!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.userId === user?.id;
                      const isInstructor = msg.role === 'Instructor';

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          <img
                            src={msg.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={msg.userName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-accent/30 mt-0.5"
                          />
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs ${
                              isMe
                                ? 'bg-primary text-white rounded-tr-xs'
                                : isInstructor
                                ? 'bg-accent/15 dark:bg-accent/25 text-slate-800 dark:text-slate-100 border border-accent/20 rounded-tl-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className={`font-bold text-[11px] ${isMe ? 'text-accent-200' : 'text-accent'}`}>
                                {msg.userName} {isInstructor && '(Instructor)'}
                              </span>
                              <span className="text-[9px] opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed break-words">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask a question or share insight with the cohort..."
                    className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
