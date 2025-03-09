# GitFlex

<p align="center">
  <img src="public/next.svg" alt="GitFlex Logo" width="100" height="100">
</p>

<p align="center">
  Analyze GitHub profiles and spot commit farmers 🚜
</p>

## 📋 Overview

GitFlex is a web application that analyzes GitHub profiles to distinguish between real developers and commit farmers. It provides a comprehensive scoring system based on various metrics to evaluate a developer's contribution patterns and quality.

## ✨ Features

- **GitHub Profile Analysis**: Enter any GitHub username to analyze their profile
- **Developer Rating**: Get an overall score and rating for the developer
- **Metrics Breakdown**: Visualize the analysis with a detailed metrics chart
- **Detailed Analysis**: View in-depth analysis of commit patterns and contribution quality

## 🔍 Metrics Analyzed

- **Commit Frequency**: Detects suspicious commit patterns
- **Code Quality**: Evaluates the quality of contributions
- **Project Diversity**: Assesses variety in projects
- **Contribution Impact**: Measures the impact of contributions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- GitHub API token (for higher rate limits)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gitflex.git
   cd gitflex
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your GitHub token:
   ```
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## 🔧 Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Data Visualization**: Chart.js, React-ChartJS-2
- **API Integration**: GitHub API (via Octokit)
- **Authentication**: Firebase Authentication (optional)
- **Database**: Firebase Firestore (optional)

## 📊 How It Works

GitFlex analyzes GitHub profiles using the following process:

1. **Data Collection**: Fetches user profile and repository data from GitHub API
2. **Commit Analysis**: Analyzes commit patterns, frequency, and content
3. **Metrics Calculation**: Computes various metrics based on the collected data
4. **Score Generation**: Generates an overall score and rating

## 📝 Rating System

- **80-100**: Real Developer 🏆
- **60-79**: Solid Contributor 👍
- **40-59**: Average Coder 👨‍💻
- **20-39**: Potential Farmer 🌱
- **0-19**: Commit Farmer 🚜

## 🔐 Privacy

GitFlex only analyzes publicly available GitHub data. No personal information is stored or shared.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and GitHub API
