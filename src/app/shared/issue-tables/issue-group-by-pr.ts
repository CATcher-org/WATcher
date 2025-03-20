import { Issue } from '../../core/models/issue.model';

export function groupByPR(data: Issue[], issuesToGroup: Issue[]): [Issue[], Issue[]] {
  const issuesReferencedByPrs: { [prId: number]: Issue[] } = {};

  const dataCopy = [...data];
  // Find all issues that are referenced by PRs and remove them from the data
  for (const issue of dataCopy) {
    if (issue.issueOrPr === 'PullRequest' && issue.state !== 'CLOSED') {
      issuesReferencedByPrs[issue.id] = [];
      const issueIdsClosedByCurrentPr = issue.closingIssuesReferences;
      for (const closedIssueId of issueIdsClosedByCurrentPr) {
        const closedIssueIndexInIssuesToGroup = issuesToGroup.findIndex((issue) => issue.id === closedIssueId);
        if (closedIssueIndexInIssuesToGroup !== -1) {
          issuesReferencedByPrs[issue.id].push(issuesToGroup[closedIssueIndexInIssuesToGroup]);
        }
        const closedIssueIndexInData = data.findIndex((issue) => issue.id === closedIssueId);
        // If the closed issue is in the data, remove it
        if (closedIssueIndexInData !== -1) {
          data.splice(closedIssueIndexInData, 1);
        }
      }
    }
  }

  // Reconstruct the data with the issues that are referenced by PRs as result
  const result = [];
  const groupedIssues = [];
  for (const issue of data) {
    result.push(issue);
    if (issue.issueOrPr === 'PullRequest' && issue.state !== 'CLOSED') {
      console.log(issuesReferencedByPrs[issue.id]);
      const issuesReferencedByCurrentPr = issuesReferencedByPrs[issue.id];
      for (const referencedIssue of issuesReferencedByCurrentPr) {
        result.push(referencedIssue);
        groupedIssues.push(referencedIssue);
      }
    }
  }

  return [result, groupedIssues];
}
