import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

function splitCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((v) => v.trim()).filter(Boolean);
}

function inferTopic(title: string, description: string): string {
  const hay = `${title} ${description}`.toLowerCase();
  if (/ethic|bias|fairness|responsible/.test(hay)) return 'ai-ethics';
  if (/nlp|language|transformer|llm|prompt|gpt/.test(hay)) return 'nlp';
  if (/vision|image|detect|opencv|cnn/.test(hay)) return 'computer-vision';
  if (/deep.?learning|neural|pytorch|tensorflow/.test(hay)) return 'deep-learning';
  if (/data.?science|pandas|analytics|statistic/.test(hay)) return 'data-science';
  if (/mlops|deploy|pipeline|production/.test(hay)) return 'mlops';
  if (/machine.?learning|ml |supervised|regression|classif/.test(hay)) return 'machine-learning';
  return 'general';
}

function normalizeLevel(level: unknown): string {
  const s = String(level || '').toLowerCase();
  if (s.includes('begin')) return 'beginner';
  if (s.includes('inter')) return 'intermediate';
  if (s.includes('adv')) return 'advanced';
  return s || 'beginner';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const topics = splitCsv(searchParams.get('topic'));
    const levels = splitCsv(searchParams.get('level'));
    const pricing = searchParams.get('pricing') || 'all';
    const featuredOnly = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sort') || 'newest';
    const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const { rows } = await pool.query(`
      SELECT 
        c.id, 
        ct.title,
        ct.slug,
        ct.description as short_description,
        ct.featured_image_url as featured_image,
        ct.author_id,
        ct.created_at,
        c.difficulty_level as level,
        c.duration,
        0 as price,
        NULL as discount_price,
        false as is_featured,
        (SELECT u.name FROM users u WHERE u.id = ct.author_id) as author_name,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as section_count,
        (
          SELECT COUNT(*) FROM course_lessons cl 
          JOIN course_modules cm ON cl.module_id = cm.id 
          WHERE cm.course_id = c.id
        ) as lesson_count
      FROM courses c
      JOIN content ct ON c.id = ct.id
      WHERE ct.status = 'published' AND ct.content_type = 'course'
      ORDER BY ct.created_at DESC
    `);

    let courses = rows.map((course) => {
      const level = normalizeLevel(course.level);
      const category = inferTopic(String(course.title || ''), String(course.short_description || ''));
      return {
        ...course,
        level,
        category,
        price: Number(course.price) || 0,
        is_featured: Boolean(course.is_featured),
        created_at: course.created_at ? new Date(course.created_at).toISOString() : null,
      };
    });

    const filterOptions = {
      topics: Array.from(new Set(courses.map((c) => c.category))).sort(),
      levels: Array.from(new Set(courses.map((c) => c.level).filter(Boolean))).sort(),
    };

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(
        (c) =>
          String(c.title || '').toLowerCase().includes(q) ||
          String(c.short_description || '').toLowerCase().includes(q) ||
          String(c.author_name || '').toLowerCase().includes(q)
      );
    }
    if (topics.length) {
      courses = courses.filter((c) => topics.includes(c.category));
    }
    if (levels.length) {
      courses = courses.filter((c) => levels.includes(c.level));
    }
    if (pricing === 'free') {
      courses = courses.filter((c) => Number(c.price) === 0);
    } else if (pricing === 'paid') {
      courses = courses.filter((c) => Number(c.price) > 0);
    }
    if (featuredOnly) {
      courses = courses.filter((c) => c.is_featured);
    }

    courses.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = String(a.title).localeCompare(String(b.title));
      else if (sortBy === 'duration') cmp = Number(a.duration || 0) - Number(b.duration || 0);
      else if (sortBy === 'level') cmp = String(a.level).localeCompare(String(b.level));
      else {
        cmp =
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return NextResponse.json({ courses, total: courses.length, filterOptions });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
