'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaGithub, FaSearch, FaSpinner } from 'react-icons/fa';
import { fetchGitHubUser, analyzeCommitFarming, GitHubUser } from '@mkay/lib/github';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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
    } catch (err) {
      console.error('Error:', err);
      setError('Error fetching GitHub profile. Please check the username and try again.');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl flex items-center justify-center gap-4">
            <FaGithub className="inline-block" />
            <span>GitFlex</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-300 sm:text-xl">
            Analyze GitHub profiles and spot commit farmers 🚜
          </p>
        </div>

        {/* Search Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter GitHub username"
                className="block w-full rounded-l-md border-0 py-3 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center rounded-r-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {/* Results */}
        {user && analysis && (
          <div className="mt-10 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            {/* User Profile */}
            <div className="px-4 py-5 sm:px-6 flex items-center">
              <img
                src={user.avatar_url}
                alt={`${user.login}'s avatar`}
                className="h-16 w-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {user.name || user.login}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
                  <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    @{user.login}
                  </a>
                </p>
                {user.bio && (
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Card */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Developer Rating</h4>
                  
                  <div className="flex items-center justify-center flex-col">
                    <div 
                      className="relative h-40 w-40 flex items-center justify-center rounded-full mb-4"
                      style={{
                        background: `conic-gradient(${getScoreColor(analysis.score)} ${analysis.score * 360}deg, #e5e7eb 0deg)`
                      }}
                    >
                      <div className="absolute h-32 w-32 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">{Math.round(analysis.score * 100)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-center" style={{ color: getScoreColor(analysis.score) }}>
                      {getRatingText(analysis.score)}
                    </h3>
                  </div>
                </div>

                {/* Metrics Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Metrics Breakdown</h4>
                  
                  <div className="h-64 flex items-center justify-center">
                    {chartData && <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />}
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
                          style={{ width: `${analysis.metrics.commitFrequency * 100}%`, backgroundColor: '#3b82f6' }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {analysis.metrics.commitFrequency < 0.3 ? 
                          'Suspicious commit patterns detected' : 
                          analysis.metrics.commitFrequency > 0.7 ? 
                            'Healthy commit patterns' : 
                            'Average commit patterns'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Code Quality</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.codeQuality * 100}%`, backgroundColor: '#8b5cf6' }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {analysis.metrics.codeQuality < 0.3 ? 
                          'Low quality contributions' : 
                          analysis.metrics.codeQuality > 0.7 ? 
                            'High quality contributions' : 
                            'Average quality contributions'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Project Diversity</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.projectDiversity * 100}%`, backgroundColor: '#ec4899' }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {analysis.metrics.projectDiversity < 0.3 ? 
                          'Limited project variety' : 
                          analysis.metrics.projectDiversity > 0.7 ? 
                            'Diverse project portfolio' : 
                            'Some project variety'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300">Contribution Impact</h5>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${analysis.metrics.contributionImpact * 100}%`, backgroundColor: '#f97316' }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {analysis.metrics.contributionImpact < 0.3 ? 
                          'Low impact contributions' : 
                          analysis.metrics.contributionImpact > 0.7 ? 
                            'High impact contributions' : 
                            'Moderate impact contributions'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

