// Random GitHub user discovery and analysis utility
import { Octokit } from '@octokit/rest';
import { analyzeCommitFarming } from './github';

// Initialize Octokit instance
const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

// Get a list of random active GitHub users
export async function getRandomUsers(count: number = 5): Promise<string[]> {
  try {
    // Search for active users with various criteria to ensure quality
    const searchQueries = [
      'followers:>10',
      'repos:>5',
      'created:<2023-01-01', // Accounts older than 2023
      'pushed:>2023-10-01',  // Active in last few months
    ];

    // Randomly select one of these qualifiers to add variety
    const randomQualifiers = [
      'language:javascript',
      'language:typescript',
      'language:python',
      'language:java',
      'language:go',
    ];

    const query = [
      ...searchQueries,
      randomQualifiers[Math.floor(Math.random() * randomQualifiers.length)],
    ].join(' ');

    const { data } = await octokit.search.users({
      q: query,
      sort: 'repositories',
      order: 'desc',
      per_page: 100,
    });

    if (!data.items.length) {
      throw new Error('No users found matching the criteria');
    }

    // Randomly select users from the results
    const shuffled = data.items
      .map(user => user.login)
      .sort(() => 0.5 - Math.random());

    return shuffled.slice(0, count);
  } catch (error: any) {
    console.error('Error fetching random users:', error);
    throw error;
  }
}

// Analyze multiple random users
export async function analyzeRandomUsers(count: number = 5) {
  try {
    const usernames = await getRandomUsers(count);
    const analyses = await Promise.all(
      usernames.map(async (username) => {
        try {
          const analysis = await analyzeCommitFarming(username);
          return { username, ...analysis };
        } catch (error) {
          console.error(`Error analyzing user ${username}:`, error);
          return null;
        }
      })
    );

    // Filter out failed analyses
    return analyses.filter(Boolean);
  } catch (error: any) {
    console.error('Error analyzing random users:', error);
    throw error;
  }
}