'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaGithub, FaSearch, FaSpinner, FaCode, FaProjectDiagram, FaCodeBranch, FaStar } from 'react-icons/fa';
import { fetchGitHubUser, analyzeCommitFarming, GitHubUser } from '../lib/github';
import Chart from '../components/Chart';
import ScoreCard from '../components/ScoreCard';

export default function Home() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [analysis, setAnalysis] = useState<{
    score: number;
    metrics: {
      commitFrequency: number;
      codeQuality: number;
      projectDiversity: number;
      contributionImpact: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError('');
    setUser(null);
    setAnalysis(null);

    try {
      // Fetch GitHub user profile
      const userData = await fetchGitHubUser(username);
      setUser(userData);

      // Analyze commit farming
      const analysisData = await analyzeCommitFarming(username);
      setAnalysis(analysisData);
    } catch (err: any) {
      console.error('Error:', err);
      
      // Display more specific error messages based on the error type
      if (err.message && err.message.includes('API rate limit exceeded')) {
        setError(
          'GitHub API rate limit exceeded. ' + 
          (err.message.includes('Rate limit will reset at') ? err.message : 
          'Please try again later or add your GitHub token in .env.local file.')
        );
      } else if (err.message && err.message.includes('authentication failed')) {
        setError('GitHub API authentication failed. Please check your token in .env.local file.');
      } else if (err.message && err.message.includes('not found')) {
        setError(`GitHub user "${username}" not found. Please check the username and try again.`);
      } else {
        setError('Error fetching GitHub profile. Please check the username and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (score: number) => {
    if (score >= 0.8) return 'Real Developer 🏆';
    if (score >= 0.6) return 'Solid Contributor 👍';
    if (score >= 0.4) return 'Average Coder 👨‍💻';
    if (score >= 0.2) return 'Potential Farmer 🌱';
    return 'Commit Farmer 🚜';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#4ade80'; // Green
    if (score >= 0.6) return '#22d3ee'; // Cyan
    if (score >= 0.4) return '#facc15'; // Yellow
    if (score >= 0.2) return '#fb923c'; // Orange
    return '#f87171'; // Red
  };

  const chartData = analysis ? {
    labels: [
      'Commit Frequency',
      'Code Quality',
      'Project Diversity',
      'Contribution Impact'
    ],
    datasets: [
      {
        data: [
          analysis.metrics.commitFrequency * 100,
          analysis.metrics.codeQuality * 100,
          analysis.metrics.projectDiversity * 100,
          analysis.metrics.contributionImpact * 100
        ],
        backgroundColor: [
          '#3b82f6', // Blue
          '#8b5cf6', // Purple
          '#ec4899', // Pink
          '#f97316', // Orange
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-primary-500 dark:bg-primary-600 p-4 rounded-full shadow-lg">
              <FaGithub className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 sm:text-5xl sm:tracking-tight lg:text-6xl">
            GitFlex
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Analyze GitHub profiles and spot commit farmers 🚜
          </p>
        </div>

        {/* Search Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg sm:rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter GitHub username"
                className="block w-full rounded-l-lg border-0 py-3 px-4 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center rounded-r-lg bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-primary-600 hover:to-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
          </div>
        </div>

        {/* Results */}
        {user && analysis && (
          <div className="mt-10 bg-white dark:bg-gray-800 shadow-lg overflow-hidden sm:rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            {/* User Profile */}
            <div className="px-6 py-6 sm:px-8 flex items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-primary-100 dark:ring-primary-900 shadow-md mr-6">
                <img
                  src={user.avatar_url}
                  alt={`${user.login}'s avatar`}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                  {user.name || user.login}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
                  <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1">
                    <FaGithub /> @{user.login}
                  </a>
                </p>
                {user.bio && (
                  <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300 italic">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-750 dark:to-gray-700 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FaStar className="text-warning-500" /> Developer Rating
                  </h4>
                  
                  <div className="flex items-center justify-center">
                    <ScoreCard score={analysis.score} size="lg" animationDuration={1500} />
                  </div>


                </div>



                {/* Metrics Chart */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-750 dark:to-gray-700 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FaProjectDiagram className="text-secondary-500" /> Metrics Breakdown
                  </h4>
                  
                  <div className="h-72 flex items-center justify-center">
                    <Chart metrics={analysis.metrics} chartType="radar" animationDuration={1500} />
                  </div>


                </div>


              </div>



              {/* Metrics Details */}
              <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Analysis</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Commit Frequency</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.commitFrequency * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-1000 ease-out"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                          <span className="inline-flex items-center">
                            <FaCodeBranch className="mr-1" /> {Math.round(analysis.metrics.commitFrequency * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Code Quality</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.codeQuality * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary-500 transition-all duration-1000 ease-out"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-semibold inline-block text-secondary-600 dark:text-secondary-400">
                          <span className="inline-flex items-center">
                            <FaCode className="mr-1" /> {Math.round(analysis.metrics.codeQuality * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Project Diversity</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.projectDiversity * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success-500 transition-all duration-1000 ease-out"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-semibold inline-block text-success-600 dark:text-success-400">
                          <span className="inline-flex items-center">
                            <FaProjectDiagram className="mr-1" /> {Math.round(analysis.metrics.projectDiversity * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Contribution Impact</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.contributionImpact * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-warning-500 transition-all duration-1000 ease-out"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-semibold inline-block text-warning-600 dark:text-warning-400">
                          <span className="inline-flex items-center">
                            <FaStar className="mr-1" /> {Math.round(analysis.metrics.contributionImpact * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
            
            {/* Footer with additional information */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Analysis based on public GitHub data. Results are for informational purposes only.</p>
            </div>
          </div>
        )}
        
        {/* App Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 pb-6 animate-fade-in">
          <p>GitFlex - Analyze GitHub profiles with style</p>
          <p className="mt-1">Built with ❤️ using Next.js and GitHub API</p>
        </footer>
      </div>
    </div>
  );
}

