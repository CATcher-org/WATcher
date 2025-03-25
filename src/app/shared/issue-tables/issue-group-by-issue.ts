import { CardData } from '../../core/models/card-data.model';
import { Issue } from '../../core/models/issue.model';

export function groupByIssue(data: Issue[]): CardData[] {
  const issuesIdsClosedByPr = new Set<number>();
  const issueIdToGroupedPrMap = new Map<number, Issue>();
  const groupedPrIds = new Set<number>();
  const groupedPrs = [];
  const issueIds = new Set<number>();

  for (const issue of data) {
    if (issue.issueOrPr !== 'Issue') {
      continue;
    }
    issueIds.add(issue.id);
  }

  for (const pr of data) {
    if (pr.issueOrPr !== 'PullRequest') {
      continue;
    }
    /*
    Note: in the case of a PR closing multiple issues, the order of sorting matters 
          in which issue the PR is grouped under. Each PR in the order they are present
          in data will be grouped under the first issue it closes that does not already
          have a PR grouped under it.
    */
    for (const issueId of pr.closingIssuesReferences) {
      // If the issue is already fixed by a previous PR, we skip it
      if (issuesIdsClosedByPr.has(issueId)) {
        continue;
      }
      // If the issue is not in the table (perhaps it is filtered out), we skip it
      if (!issueIds.has(issueId)) {
        continue;
      }
      issuesIdsClosedByPr.add(issueId);
      issueIdToGroupedPrMap.set(issueId, pr);
      groupedPrIds.add(pr.id);
      groupedPrs.push(pr);
      break;
    }
  }

  const result = [];
  for (const issue of data) {
    if (groupedPrIds.has(issue.id)) {
      continue;
    }
    result.push({ issue, isIndented: false });
    if (issueIdToGroupedPrMap.has(issue.id)) {
      result.push({ issue: issueIdToGroupedPrMap.get(issue.id), isIndented: true });
    }
  }

  return result;
}
