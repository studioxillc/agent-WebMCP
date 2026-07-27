import { execSync } from 'node:child_process';

async function runAICodeReview() {
  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;

  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY is not set. Skipping AI Code Review.');
    console.log('Tip: Add GEMINI_API_KEY to GitHub Repository Secrets to enable automated Gemini code reviews.');
    return;
  }

  // Get PR diff against target branch (default main)
  const baseBranch = process.env.GITHUB_BASE_REF || 'main';
  let diff = '';
  try {
    diff = execSync(`git diff origin/${baseBranch}...HEAD`, { encoding: 'utf8' });
  } catch (err: any) {
    console.error('Failed to get git diff:', err.message);
    return;
  }

  if (!diff.trim()) {
    console.log('No code changes detected in diff.');
    return;
  }

  // Truncate diff if extremely large
  const maxDiffLength = 50000;
  const truncatedDiff = diff.length > maxDiffLength ? diff.slice(0, maxDiffLength) + '\n... [Diff truncated]' : diff;

  console.log(`🤖 Sending PR diff (${diff.length} bytes) to Gemini API for code review...`);

  const prompt = `You are a Senior Staff Code Reviewer auditing a Pull Request for **agent-WebMCP** (@thestudioxi/webmcp).

### Repository Architecture & Standards:
1. **Runtime & Tooling**: Bun + TypeScript monorepo.
2. **Strict Typing**: Strict interfaces, no implicit 'any'.
3. **Async Safety**: Connection disconnection and error handling in WebMCP transports.
4. **Zero Overhead**: Core SDK zero-dependency constraint.

### Task:
Review the PR code diff below and provide a concise, structured code review with:
- 🟢 **Strengths**: What is done well.
- 🟡 **Suggestions / Improvements**: Maintainability, performance, or typing recommendations (if any).
- 🔴 **Critical Issues**: Bugs, memory/connection leaks, or breaking contract changes (if any).

If the PR looks clean and ready to merge, give a clear LGTM approval recommendation!

### Pull Request Diff:
\`\`\`diff
${truncatedDiff}
\`\`\``;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reviewText) {
      console.error('Received empty response from Gemini API.');
      return;
    }

    console.log('\n--- 🤖 GEMINI CODE REVIEW ---');
    console.log(reviewText);

    // Post to GitHub PR if token and PR number are provided
    if (githubToken && repo && prNumber) {
      const commentHeader = '## 🤖 Gemini AI Code Review\n\n';
      const commentBody = commentHeader + reviewText;

      const commentResponse = await fetch(
        `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'WebMCP-AI-Reviewer',
          },
          body: JSON.stringify({ body: commentBody }),
        }
      );

      if (commentResponse.ok) {
        console.log(`\n✅ Successfully posted Gemini Code Review to PR #${prNumber}!`);
      } else {
        const commentErr = await commentResponse.text();
        console.error('Failed to post comment to GitHub PR:', commentErr);
      }
    }
  } catch (err: any) {
    console.error('AI Code Review failed:', err.message);
  }
}

runAICodeReview();
