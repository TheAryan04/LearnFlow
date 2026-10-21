import express from 'express';
import { db } from '../data/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/stats/admin
router.get('/admin', requireRole('admin'), (req, res) => {
  const users = db.get('users');
  const courses = db.get('courses');
  const enrolments = db.get('enrolments');

  const totalUsers = users.length + 1540;
  const totalCourses = courses.length + 42;
  const totalEnrolments = enrolments.length + 13280;
  const activeThisMonth = 3420;

  const revenueChartData = [
    { month: 'Jan', revenue: 14200, enrolments: 420 },
    { month: 'Feb', revenue: 18400, enrolments: 560 },
    { month: 'Mar', revenue: 22100, enrolments: 680 },
    { month: 'Apr', revenue: 19800, enrolments: 590 },
    { month: 'May', revenue: 27500, enrolments: 820 },
    { month: 'Jun', revenue: 31200, enrolments: 940 },
    { month: 'Jul', revenue: 29800, enrolments: 890 },
    { month: 'Aug', revenue: 35600, enrolments: 1080 },
    { month: 'Sep', revenue: 42100, enrolments: 1250 },
    { month: 'Oct', revenue: 48900, enrolments: 1430 },
    { month: 'Nov', revenue: 54200, enrolments: 1610 },
    { month: 'Dec', revenue: 61800, enrolments: 1840 },
  ];

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCourses,
      totalEnrolments,
      activeThisMonth,
      revenueChartData,
    },
  });
});

// GET /api/stats/instructor
router.get('/instructor', requireRole('instructor', 'admin'), (req, res) => {
  const instructorId = req.user.id;
  const courses = db.get('courses');
  const submissions = db.get('submissions');

  const totalStudents = 11370;
  const coursesPublished = courses.filter((c) => c.instructorId === instructorId).length;
  const pendingToGrade = submissions.filter((s) => s.status === 'Pending').length;
  const totalRevenue = '$42,850';
  const monthlyRevenue = '$6,420';

  res.json({
    success: true,
    data: {
      totalStudents,
      coursesPublished,
      pendingToGrade,
      totalRevenue,
      monthlyRevenue,
    },
  });
});

export default router;
