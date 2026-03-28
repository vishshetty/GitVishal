export interface JiraStory {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
}

export class JiraService {
  async fetchUserStories(): Promise<JiraStory[]> {
    const host = process.env.JIRA_HOST?.replace(/^https?:\/\//, '');
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const projectKey = process.env.JIRA_PROJECT || 'KAN';

    if (!host || !email || !token) {
      console.warn("Jira credentials missing. Falling back to mock data.");
      return this.mockFetch();
    }

    try {
      const url = `https://${host}/rest/api/3/search/jql`;
      const authToken = Buffer.from(`${email}:${token}`).toString('base64');
      const jql = `project = "${projectKey}" AND issuetype = Story ORDER BY created DESC`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql: jql,
          maxResults: 50,
          fields: ["summary", "description", "status", "priority"]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Jira API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      return data.issues.map((issue: any) => {
        let parsedDescription = '';
        if (issue.fields.description && typeof issue.fields.description === 'object' && issue.fields.description.content) {
            parsedDescription = issue.fields.description.content
                .map((contentBlock: any) => contentBlock.content?.map((textNode: any) => textNode.text).join('') || '')
                .join('\n');
        } else if (typeof issue.fields.description === 'string') {
            parsedDescription = issue.fields.description;
        }

        return {
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          description: parsedDescription || 'No description provided.',
          status: issue.fields.status?.name || 'Unknown',
          priority: issue.fields.priority?.name || 'None'
        };
      });
    } catch (e) {
      console.error("Failed to fetch from Jira", e);
      return this.mockFetch();
    }
  }

  private async mockFetch(): Promise<JiraStory[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        id: "1001",
        key: "TO-123",
        summary: "Implement Secure User Login",
        description: "As a user, I want to log in securely using my email and password so that I can access my dashboard.",
        status: "To Do",
        priority: "High"
      },
      {
        id: "1002",
        key: "TO-124",
        summary: "Export Test Cases to CSV",
        description: "As a QA lead, I want to export generated test cases to a CSV file for external reporting.",
        status: "In Progress",
        priority: "Medium"
      },
      {
        id: "1003",
        key: "TO-125",
        summary: "Real-time Notification of Test Completion",
        description: "As a developer, I want to receive a notification when the automated test suite completes.",
        status: "To Do",
        priority: "Low"
      }
    ];
  }
}

export const jiraService = new JiraService();
