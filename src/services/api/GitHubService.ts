interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

interface GitHubStats {
  stars: number;
  forks: number;
  issues: number;
  language: string;
  lastUpdated: string;
  lastPushed: string;
  releases: GitHubRelease[];
  latestRelease?: GitHubRelease;
}

export class GitHubService {
  private apiKey?: string;
  private cache: Map<string, { data: GitHubStats; timestamp: number }> = new Map();
  private cacheTTL = 3600000; // 1 hour in milliseconds

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GITHUB_API_KEY;
  }

  /**
   * Extract GitHub owner and repo from URL or identifier
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    // Handle full URLs: https://github.com/owner/repo
    const fullUrlMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/);
    if (fullUrlMatch) {
      return { owner: fullUrlMatch[1], repo: fullUrlMatch[2].replace(/\.git$/, '') };
    }

    // Handle owner/repo format
    const ownerRepoMatch = url.match(/^([^\/]+)\/([^\/]+)$/);
    if (ownerRepoMatch) {
      return { owner: ownerRepoMatch[1], repo: ownerRepoMatch[2].replace(/\.git$/, '') };
    }

    return null;
  }

  /**
   * Fetch repository stats from GitHub API
   */
  async fetchRepoStats(githubUrl: string): Promise<GitHubStats | null> {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        console.log(`[GitHub] Invalid GitHub URL format: ${githubUrl}`);
        return null;
      }

      const { owner, repo } = parsed;
      const cacheKey = `${owner}/${repo}`;

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[GitHub] Using cached stats for ${cacheKey}`);
        return cached.data;
      }

      console.log(`[GitHub] Fetching stats for ${owner}/${repo}`);

      // Fetch repository info
      const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (this.apiKey) {
        headers['Authorization'] = `token ${this.apiKey}`;
      }

      const repoResponse = await fetch(repoUrl, { headers });
      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          console.log(`[GitHub] Repository ${owner}/${repo} not found`);
          return null;
        }
        throw new Error(`GitHub API error: ${repoResponse.statusText}`);
      }

      const repoData: GitHubRepo = await repoResponse.json();

      // Fetch releases
      let releases: GitHubRelease[] = [];
      try {
        const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`;
        const releasesResponse = await fetch(releasesUrl, { headers });
        if (releasesResponse.ok) {
          releases = await releasesResponse.json();
          // Filter out drafts and only get published releases
          releases = releases.filter(r => !r.draft && !r.prerelease);
        }
      } catch (e) {
        console.log(`[GitHub] Could not fetch releases:`, e);
      }

      const stats: GitHubStats = {
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        issues: repoData.open_issues_count || 0,
        language: repoData.language || 'Unknown',
        lastUpdated: repoData.updated_at,
        lastPushed: repoData.pushed_at,
        releases: releases.slice(0, 10), // Keep last 10 releases
        latestRelease: releases.length > 0 ? releases[0] : undefined
      };

      // Cache the result
      this.cache.set(cacheKey, { data: stats, timestamp: Date.now() });

      console.log(`[GitHub] Successfully fetched stats for ${owner}/${repo}:`, {
        stars: stats.stars,
        forks: stats.forks,
        issues: stats.issues,
        releases: releases.length
      });

      return stats;
    } catch (error) {
      console.error(`[GitHub] Error fetching repository stats:`, error);
      return null;
    }
  }

  /**
   * Fetch release history
   */
  async fetchReleases(githubUrl: string, limit: number = 10): Promise<GitHubRelease[]> {
    try {
      const parsed = this.parseGitHubUrl(githubUrl);
      if (!parsed) {
        return [];
      }

      const { owner, repo } = parsed;
      const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (this.apiKey) {
        headers['Authorization'] = `token ${this.apiKey}`;
      }

      const response = await fetch(releasesUrl, { headers });
      if (!response.ok) {
        return [];
      }

      const releases: GitHubRelease[] = await response.json();
      return releases.filter(r => !r.draft && !r.prerelease).slice(0, limit);
    } catch (error) {
      console.error(`[GitHub] Error fetching releases:`, error);
      return [];
    }
  }

  /**
   * Get latest release tag
   */
  async getLatestReleaseTag(githubUrl: string): Promise<string | null> {
    try {
      const stats = await this.fetchRepoStats(githubUrl);
      return stats?.latestRelease?.tag_name || null;
    } catch (error) {
      console.error(`[GitHub] Error fetching latest release tag:`, error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}

