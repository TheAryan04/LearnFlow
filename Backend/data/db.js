import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialUsers,
  initialCourses,
  initialEnrolments,
  initialAssignments,
  initialSubmissions,
  initialAttendance,
  initialResults,
  initialNotifications,
  initialMaterials,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// In-memory cache synced with disk
let dbData = {
  users: [...initialUsers],
  courses: [...initialCourses],
  enrolments: [...initialEnrolments],
  assignments: [...initialAssignments],
  submissions: [...initialSubmissions],
  attendance: [...initialAttendance],
  results: [...initialResults],
  notifications: [...initialNotifications],
  materials: [...initialMaterials],
  discussions: [
    {
      id: 'disc_1',
      courseId: 'course_react_mastery',
      userId: 'user_student_1',
      userName: 'Alex Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      message: 'Does React 19 replace useMemo completely with the React Compiler?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      role: 'Student'
    },
    {
      id: 'disc_2',
      courseId: 'course_react_mastery',
      userId: 'user_instructor_1',
      userName: 'Dr. Marcus Vance',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      message: 'Great question Alex! The React Compiler automatically memoizes components and hooks, but manual useMemo is still supported for fine-grained control.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      role: 'Instructor'
    }
  ]
};

// Initialize or read from disk
export function initDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      dbData = { ...dbData, ...parsed };
      console.log('📦 Persistent database loaded from db.json');
    } else {
      saveDB();
      console.log('📦 Persistent database initialized with default seed data in db.json');
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
}

// Persist to disk
let saveTimeout = null;
export function saveDB() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json to disk:', err);
    }
  }, 100);
}

// Database query helpers
export const db = {
  get: (collection) => dbData[collection] || [],
  set: (collection, data) => {
    dbData[collection] = data;
    saveDB();
  },
  insert: (collection, item) => {
    if (!dbData[collection]) dbData[collection] = [];
    dbData[collection].unshift(item);
    saveDB();
    return item;
  },
  update: (collection, predicate, updater) => {
    if (!dbData[collection]) return null;
    const index = dbData[collection].findIndex(predicate);
    if (index !== -1) {
      const updated = typeof updater === 'function' ? updater(dbData[collection][index]) : { ...dbData[collection][index], ...updater };
      dbData[collection][index] = updated;
      saveDB();
      return updated;
    }
    return null;
  },
  delete: (collection, predicate) => {
    if (!dbData[collection]) return false;
    const initialLen = dbData[collection].length;
    dbData[collection] = dbData[collection].filter((item) => !predicate(item));
    const deleted = dbData[collection].length < initialLen;
    if (deleted) saveDB();
    return deleted;
  }
};
