import { ApiError, find, findOne, insert, update, uid, num, db } from '../core.js';
import { parsePageOptions } from '../utils/pagination.js';

const YT_RE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
const youtubeId = (url) => (String(url || '').match(YT_RE) || [])[1] || null;
const EDITABLE = ['title', 'category', 'price', 'thumbnail', 'description', 'curriculum', 'previewYoutubeUrl', 'status', 'level', 'language', 'shortDescription', 'featured'];
const SORTS = { popular: ['enrolledCount', -1], 'price-low': ['price', 1], 'price-high': ['price', -1], rating: ['rating', -1] };

export async function listPublishedCourses({ search, category, sort, page, limit }) {
  const filter = { status: 'published' };
  if (category && category !== 'All') {
    const escapedCategory = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.category = new RegExp(`^${escapedCategory}$`, 'i');
  }
  if (search) {
    const q = String(search).trim().slice(0, 100);
    if (q) {
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matcher = new RegExp(escapedQuery, 'i');
      filter.$or = [
        { title: matcher },
        { category: matcher },
        { instructorName: matcher },
      ];
    }
  }

  const pagination = parsePageOptions({ page, limit });
  const sortSpec = SORTS[sort]
    ? { [SORTS[sort][0]]: SORTS[sort][1], _order: -1 }
    : { _order: -1 };
  const collection = db.collection('courses');
  const total = await collection.countDocuments(filter);
  let cursor = collection.find(filter, { projection: { _id: 0, _order: 0 } }).sort(sortSpec);
  if (pagination.enabled) {
    cursor = cursor.skip(pagination.skip).limit(pagination.limit);
  }
  const courses = await cursor.toArray();

  return {
    courses,
    total,
    ...(pagination.enabled
      ? {
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(total / pagination.limit),
        }
      : {}),
  };
}

export const listManagedCourses = (user) =>
  find('courses', user.role === 'admin' ? {} : { instructorId: user.id });

export async function getCourse(id) {
  const course = await findOne('courses', { id });
  if (!course || course.status !== 'published') throw new ApiError(404, 'Course not found');
  return course;
}

export async function ownedCourse(courseId, user) {
  const course = await findOne('courses', { id: courseId });
  if (!course) throw new ApiError(404, 'Course not found');
  if (user.role !== 'admin' && course.instructorId !== user.id) {
    throw new ApiError(403, "Cannot modify another instructor's course");
  }
  return course;
}

export async function createCourse(body, user) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 160) throw new ApiError(400, 'Course title is required and must be at most 160 characters');
  const status = body.status || 'draft';
  if (!['draft', 'published', 'under-review'].includes(status)) throw new ApiError(400, 'Course status must be draft, under-review, or published');
  let owner = await findOne('users', { id: user.id });
  if (user.role === 'admin' && body.instructorId) {
    owner = await findOne('users', { id: body.instructorId, role: 'Instructor' });
    if (!owner) throw new ApiError(400, 'Instructor not found');
  }
  if (!owner) throw new ApiError(404, 'Instructor profile not found');
  const preview = body.previewYoutubeUrl || 'https://www.youtube.com/watch?v=bMknfKXIFA8';
  const course = {
    id: uid('course'), title, category: body.category || 'Development',
    price: num(body.price ?? 0, 'Price'), rating: 5.0, reviewCount: 0,
    instructorId: owner.id, instructorName: owner.name, instructorAvatar: owner.avatar,
    thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    durationMs: 7200000, enrolledCount: 0, status, featured: false,
    previewYoutubeUrl: preview, previewYoutubeId: youtubeId(preview) || 'bMknfKXIFA8',
    description: body.description || '<p>Welcome to this course.</p>', curriculum: body.curriculum || [], reviews: [],
  };
  for (const k of ['level', 'language', 'shortDescription']) if (k in body) course[k] = body[k];
  await insert('courses', course);
  return course;
}

export async function updateCourse(courseId, user, body) {
  await ownedCourse(courseId, user);
  const changes = Object.fromEntries(Object.entries(body || {}).filter(([k]) => EDITABLE.includes(k)));
  if ('title' in changes) {
    if (typeof changes.title !== 'string' || !changes.title.trim() || changes.title.trim().length > 160) {
      throw new ApiError(400, 'Course title must be between 1 and 160 characters');
    }
    changes.title = changes.title.trim();
  }
  if ('status' in changes && !['draft', 'published', 'under-review'].includes(changes.status)) {
    throw new ApiError(400, 'Course status must be draft, under-review, or published');
  }
  if ('price' in changes) changes.price = num(changes.price, 'Price');
  if ('featured' in changes && user.role !== 'admin') delete changes.featured;
  if (youtubeId(changes.previewYoutubeUrl)) changes.previewYoutubeId = youtubeId(changes.previewYoutubeUrl);
  return update('courses', courseId, changes);
}

export async function deleteCourse(courseId, user) {
  await ownedCourse(courseId, user);
  await db.collection('courses').deleteOne({ id: courseId });
}
