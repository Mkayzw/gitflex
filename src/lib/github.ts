// GitHub API utilities for GitFlex
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

// Add throttling plugin to Octokit
const ThrottledOctokit = Octokit.plugin(throttling);

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Initialize Octokit with GitHub token if available and throttling configuration
const octokit = new ThrottledOctokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter: number, options: any) => {
      console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
      // Retry twice after hitting a rate limit
      if (options.request.retryCount <= 2) {
        console.log(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter: number, options: any) => {
      // Secondary rate limit (abuse detection) retry once
      if (options.request.retryCount <= 1) {
        return true;
      }
    },
  },
});

// Helper function to get cached data or fetch new data
const getCachedOrFetch = async <T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> => {
  const cached = apiCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached data for ${cacheKey}`);
    return cached.data as T;
  }
  
  const data = await fetchFn();
  apiCache.set(cacheKey, { data, timestamp: now });
  return data;
};

// Helper function to handle API errors, especially rate limiting
const handleApiError = (error: any, context: string) => {
  // Handle rate limit errors
  if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
    const resetTime = error.response?.headers?.['x-ratelimit-reset'];
    let resetMessage = '';
    
    if (resetTime) {
      const resetDate = new Date(parseInt(resetTime) * 1000);
      resetMessage = ` Rate limit will reset at ${resetDate.toLocaleTimeString()}.`;
    }
    
    console.error(`GitHub API rate limit exceeded during ${context}.${resetMessage} Please ensure you have set a valid GitHub token in your .env.local file.`);
    throw new Error(
      `GitHub API rate limit exceeded.${resetMessage} Please make sure you have added a valid GitHub personal access token in your .env.local file.\n` +
      'See the README.md for instructions on how to create and configure your token.'
    );
  }
  
  // Handle authentication errors
  if (error.status === 401) {
    console.error(`GitHub API authentication failed during ${context}. Please check your token.`);
    throw new Error(
      'GitHub API authentication failed. Your token may be invalid or expired.\n' +
      'Please make sure you have added a valid GitHub personal access token in your .env.local file.'
    );
  }
  
  // Handle not found errors
  if (error.status === 404) {
    console.error(`Resource not found during ${context}: ${error.message}`);
    throw new Error(`GitHub resource not found. Please check the provided information and try again.`);
  }
  
  console.error(`Error during ${context}:`, error);
  throw error;
};

// Types for GitHub data
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// Fetch GitHub user profile
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  try {
    return await getCachedOrFetch<GitHubUser>(`user:${username}`, async () => {
      const { data } = await octokit.users.getByUsername({
        username,
      });
      return data as GitHubUser;
    });
  } catch (error) {
    handleApiError(error, 'fetching GitHub user');
  }
}

// Fetch user repositories
export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  try {
    return await getCachedOrFetch<GitHubRepo[]>(`repos:${username}`, async () => {
      const { data } = await octokit.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100,
      });
      return data as GitHubRepo[];
    });
  } catch (error) {
    handleApiError(error, 'fetching user repositories');
  }
}

// Fetch user commits for a specific repository
export async function fetchRepoCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
  try {
    return await getCachedOrFetch<GitHubCommit[]>(`commits:${owner}/${repo}`, async () => {
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100,
      });
      return data as GitHubCommit[];
    });
  } catch (error) {
    handleApiError(error, `fetching commits for ${owner}/${repo}`);
  }
}

// Fetch commit details including stats (additions/deletions)
export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
  try {
    return await getCachedOrFetch<GitHubCommit>(`commit:${owner}/${repo}/${sha}`, async () => {
      const { data } = await octokit.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });
      return data as GitHubCommit;
    });
  } catch (error) {
    handleApiError(error, `fetching commit details for ${sha}`);
  }
}

// Analyze if a user is a commit farmer
export async function analyzeCommitFarming(username: string): Promise<{
  score: number;
  metrics: {
    commitFrequency: number;
    codeQuality: number;
    projectDiversity: number;
    contributionImpact: number;
  };
}> {
  try {
    // Fetch user repositories
    const repos = await fetchUserRepos(username);
    
    // Skip forked repositories for analysis
    const ownRepos = repos.filter(repo => !repo.fork);
    
    if (ownRepos.length === 0) {
      return {
        score: 0,
        metrics: {
          commitFrequency: 0,
          codeQuality: 0,
          projectDiversity: 0,
          contributionImpact: 0,
        },
      };
    }
    
    // Analyze commit patterns across repositories
    let totalCommits = 0;
    let totalAdditions = 0;
    let totalDeletions = 0;
    let commitDates: Date[] = [];
    
    // Limit to 5 repos for analysis to avoid rate limiting
    const reposToAnalyze = ownRepos.slice(0, 5);
    
    for (const repo of reposToAnalyze) {
      const [owner, repoName] = repo.full_name.split('/');
      const commits = await fetchRepoCommits(owner, repoName);
      
      totalCommits += commits.length;
      
      // Collect commit dates for frequency analysis
      commitDates = [
        ...commitDates,
        ...commits.map(commit => new Date(commit.commit.author.date)),
      ];
      
      // Sample some commits for detailed analysis
      const commitsToAnalyze = commits.slice(0, 5);
      for (const commit of commitsToAnalyze) {
        const details = await fetchCommitDetails(owner, repoName, commit.sha);
        if (details.stats) {
          totalAdditions += details.stats.additions;
          totalDeletions += details.stats.deletions;
        }
      }
    }
    
    // Calculate metrics
    
    // 1. Commit Frequency - Check for suspicious patterns like many commits in short time
    let commitFrequency = 0.5; // Default neutral score
    if (commitDates.length > 1) {
      // Sort dates and check time between commits
      commitDates.sort((a, b) => a.getTime() - b.getTime());
      
      let suspiciousPatterns = 0;
      for (let i = 1; i < commitDates.length; i++) {
        const timeDiff = commitDates[i].getTime() - commitDates[i-1].getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // Flag very frequent commits (less than 5 minutes apart)
        if (minutesDiff < 5) {
          suspiciousPatterns++;
        }
      }
      
      // Calculate frequency score (lower is more suspicious)
      commitFrequency = Math.max(0, 1 - (suspiciousPatterns / commitDates.length));
    }
    
    // 2. Code Quality - Based on ratio of additions to deletions
    // Healthy development usually has a mix of additions and deletions
    let codeQuality = 0.5; // Default neutral score
    if (totalAdditions + totalDeletions > 0) {
      const ratio = totalDeletions / (totalAdditions + totalDeletions);
      // Very low deletion ratio might indicate just adding trivial code
      codeQuality = ratio < 0.1 ? 0.3 : ratio > 0.5 ? 0.9 : 0.6;
    }
    
    // 3. Project Diversity - Based on number of non-fork repositories
    const projectDiversity = Math.min(1, ownRepos.length / 10); // Scale up to 10 repos
    
    // 4. Contribution Impact - Based on stars and forks of repositories
    let contributionImpact = 0;
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    if (totalStars > 100 || totalForks > 20) {
      contributionImpact = 1; // High impact
    } else if (totalStars > 10 || totalForks > 5) {
      contributionImpact = 0.7; // Medium impact
    } else {
      contributionImpact = 0.3; // Low impact
    }
    
    // Calculate overall score (0-1 scale, higher is more "real dev")
    const score = (
      commitFrequency * 0.4 + 
      codeQuality * 0.3 + 
      projectDiversity * 0.1 + 
      contributionImpact * 0.2
    );
    
    return {
      score,
      metrics: {
        commitFrequency,
        codeQuality,
        projectDiversity,
        contributionImpact,
      },
    };
  } catch (error) {
    handleApiError(error, 'analyzing commit farming');
  }
}