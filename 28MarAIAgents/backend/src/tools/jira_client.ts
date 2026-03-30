import axios from 'axios';

function getAuthHeaders(email: string, token: string) {
    const creds = Buffer.from(`${email}:${token}`).toString('base64');
    return {
        'Authorization': `Basic ${creds}`,
        'Accept': 'application/json'
    };
}

function parseAdfText(node: any): string {
    if (!node) return "";
    if (typeof node === "string") return node;
    const type = node.type || "";
    const content = node.content || [];
    const text = node.text || "";

    if (type === "text") return text;
    if (type === "paragraph") return content.map(parseAdfText).join(" ") + "\n";
    if (type === "bulletList" || type === "orderedList") return content.map((c:any) => `• ${parseAdfText(c).trim()}`).join("\n") + "\n";
    if (type === "listItem") return content.map(parseAdfText).join(" ");
    if (type === "heading") {
        const lvl = node.attrs?.level || 2;
        return "#".repeat(lvl) + " " + content.map(parseAdfText).join(" ") + "\n";
    }
    if (type === "doc") return content.map(parseAdfText).join("\n");
    return content.map(parseAdfText).join(" ");
}

function parseDesc(desc: any): string {
    if (!desc) return "";
    if (typeof desc === "string") return desc;
    if (typeof desc === "object") return parseAdfText(desc).trim();
    return String(desc);
}

function parseIssue(issue: any): any {
    const f = issue.fields || {};
    const story_pts = f.story_points || f.customfield_10016 || f.customfield_10014 || null;
    let sprint_name = null;
    const sprint_field = f.customfield_10020 || f.customfield_10021;
    if (Array.isArray(sprint_field) && sprint_field.length > 0) {
        const last = sprint_field[sprint_field.length - 1];
        sprint_name = typeof last === 'object' ? last.name : String(last);
    } else if (sprint_field && typeof sprint_field === 'object') {
        sprint_name = sprint_field.name;
    }

    return {
        id: issue.id,
        key: issue.key,
        summary: f.summary || "",
        description: parseDesc(f.description),
        issue_type: f.issuetype ? f.issuetype.name : "Story",
        status: f.status ? f.status.name : "Unknown",
        priority: f.priority ? f.priority.name : "Medium",
        assignee: f.assignee ? f.assignee.displayName : null,
        reporter: f.reporter ? f.reporter.displayName : null,
        story_points: story_pts,
        labels: f.labels || [],
        sprint: sprint_name,
        created: f.created,
        updated: f.updated
    };
}

export async function testConnection(host: string, email: string, api_token: string) {
    const url = `https://${host}/rest/api/3/myself`;
    try {
        const res = await axios.get(url, { headers: getAuthHeaders(email, api_token), timeout: 15000 });
        return { ok: true, message: `Connected as ${res.data.displayName}`, email: res.data.emailAddress };
    } catch (e: any) {
        if (e.response?.status === 401) return { ok: false, message: "Authentication failed. Check your email and API token." };
        return { ok: false, message: `Failed: ${e.message}` };
    }
}

export async function getProjectIssues(host: string, email: string, api_token: string, projectKey: string, sprint?: string) {
    let jql = `project = ${projectKey} ORDER BY priority DESC`;
    if (projectKey.includes('-')) {
        jql = `key = ${projectKey}`;
    } else if (sprint) {
        jql = `project = ${projectKey} AND sprint = '${sprint}' ORDER BY priority DESC`;
    }
    const url = `https://${host}/rest/api/3/search/jql`;
    
    try {
        const res = await axios.get(url, {
            headers: getAuthHeaders(email, api_token),
            params: {
                jql, 
                maxResults: 50,
                fields: "summary,description,issuetype,status,priority,assignee,reporter,customfield_10016,customfield_10014,customfield_10020,customfield_10021,labels,created,updated"
            },
            timeout: 30000
        });
        
        return { ok: true, issues: res.data.issues.map(parseIssue), total: res.data.total };
    } catch (e: any) {
        if (e.response?.status === 400) return { ok: false, message: "Invalid project key or JQL" };
        return { ok: false, message: `Failed: ${e.message}` };
    }
}
