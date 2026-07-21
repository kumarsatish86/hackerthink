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

function inferToolMetadata(tool: {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  file_path?: string | null;
}) {
  const title = (tool.title || '').toLowerCase();
  const slug = (tool.slug || '').toLowerCase();
  const description = (tool.description || '').toLowerCase();
  const hay = `${title} ${slug} ${description}`;

  let category = 'other';
  let platform = 'web';
  let license = 'Open Source';
  let popularity = 78;
  let usersCount = 8000;

  if (/prompt|persona|headline|chat.?style|emotion|resume|cover.?letter|logo.?prompt|image.?prompt|script.?to.?scene|accent/.test(hay)) {
    category = 'prompting';
    popularity = 88;
  } else if (/dataset|token.?estim|similarity|quality.?score|license.?check|storage.?estim|model.?matrix|finder/.test(hay)) {
    category = 'datasets';
    popularity = 84;
  } else if (/cost|roi|pricing|hardware.?estim|image.?size|planner|roadmap|workflow|content.?planner/.test(hay)) {
    category = 'cost-planning';
    popularity = 86;
  } else if (/ethic|privacy|policy|voice.?cloning|legality|risk/.test(hay)) {
    category = 'security';
    popularity = 80;
  } else if (/nlp|transformer|language|text/.test(hay)) {
    category = 'nlp';
  } else if (/vision|image|opencv|detect/.test(hay)) {
    category = 'computer-vision';
  } else if (/model.?finder|comparison|matrix|machine.?learning|ml /.test(hay)) {
    category = 'machine-learning';
  } else if (/automat|ansible|workflow|blueprint/.test(hay)) {
    category = 'automation';
  } else if (/git|develop|code|formatter|rag|chunk/.test(hay)) {
    category = 'development';
  }

  if (/python|pytorch|tensorflow|jupyter|pandas/.test(hay)) platform = 'python';
  else if (/javascript|node|react|next/.test(hay)) platform = 'javascript';
  else if (/cloud|api|saas|openai/.test(hay)) platform = 'cloud';
  else if (/linux|cli|terminal/.test(hay)) platform = 'linux';
  else platform = 'web';

  if (/mit/.test(hay)) license = 'MIT';
  else if (/apache/.test(hay)) license = 'Apache 2.0';
  else if (/api|proprietary|closed/.test(hay)) license = 'API';
  else license = 'Open Source';

  // Stable-ish pseudo metrics from slug length (avoid random flicker)
  const seed = Array.from(slug).reduce((a, c) => a + c.charCodeAt(0), 0);
  popularity = Math.min(98, Math.max(70, popularity + (seed % 12)));
  usersCount = 3000 + (seed % 40) * 1200;

  return {
    ...tool,
    category,
    platform,
    license,
    official_url: tool.slug ? `/tools/${tool.slug}` : '#',
    popularity,
    users_count: usersCount,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categories = splitCsv(searchParams.get('category'));
    const platforms = splitCsv(searchParams.get('platform'));
    const licenses = splitCsv(searchParams.get('license'));
    const popularOnly = searchParams.get('popular') === 'true';
    const sortBy = searchParams.get('sort') || 'title';
    const sortOrder = searchParams.get('order') === 'desc' ? 'desc' : 'asc';

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, title, slug, description, icon, file_path
        FROM tools
        WHERE published = true
        ORDER BY title ASC
      `);

      let tools = result.rows.map(inferToolMetadata);

      const filterOptions = {
        categories: Array.from(new Set(tools.map((t) => t.category))).sort(),
        platforms: Array.from(new Set(tools.map((t) => t.platform))).sort(),
        licenses: Array.from(new Set(tools.map((t) => t.license))).sort(),
      };

      if (search) {
        const q = search.toLowerCase();
        tools = tools.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q)
        );
      }
      if (categories.length) {
        tools = tools.filter((t) => categories.includes(t.category));
      }
      if (platforms.length) {
        tools = tools.filter((t) => platforms.includes(t.platform));
      }
      if (licenses.length) {
        tools = tools.filter((t) =>
          licenses.some((l) => t.license.toLowerCase().includes(l.toLowerCase()))
        );
      }
      if (popularOnly) {
        tools = tools.filter((t) => t.popularity >= 85);
      }

      tools.sort((a, b) => {
        let av: string | number = a.title;
        let bv: string | number = b.title;
        if (sortBy === 'popularity') {
          av = a.popularity;
          bv = b.popularity;
        } else if (sortBy === 'users') {
          av = a.users_count;
          bv = b.users_count;
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortOrder === 'asc' ? av - bv : bv - av;
        }
        const cmp = String(av).localeCompare(String(bv));
        return sortOrder === 'asc' ? cmp : -cmp;
      });

      return NextResponse.json({ tools, total: tools.length, filterOptions });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools', details: (error as Error).message },
      { status: 500 }
    );
  }
}
