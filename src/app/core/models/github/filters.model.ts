import { Sort } from '@angular/material/sort';
import {
  OrderOptions,
  SortOptions,
  StatusOptions,
  TypeOptions
} from '../../constants/filter-options.constants';

/**
 * Raw data shape used to construct a Filter.
 * Kept separate from the Filter instance type for strong typing.
 */
export interface FilterProps {
  title: string;
  status: string[];
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels: Set<string>;
  deselectedLabels: Set<string>;
  itemsPerPage: number;
  assignees: string[];
}

/** Patch/update type for Filter props/properties (safe alternative to Partial<Filter>). */
export type FilterUpdate = Partial<FilterProps>;

/**
 * Filter is an immutable value object.
 * Use .clone(...) to produce a new instance with changes.
 */
export class Filter {
  readonly title: string;
  readonly status: string[];
  readonly type: string;
  readonly sort: Sort;
  readonly labels: string[];
  readonly milestones: string[];
  readonly hiddenLabels: Set<string>;
  readonly deselectedLabels: Set<string>;
  readonly itemsPerPage: number;
  readonly assignees: string[];

  constructor(props: FilterProps) {
    this.title = props.title;
    this.status = [...props.status];
    this.type = props.type;
    this.sort = { ...props.sort };
    this.labels = [...props.labels];
    this.milestones = [...props.milestones];
    this.hiddenLabels = new Set(props.hiddenLabels);
    this.deselectedLabels = new Set(props.deselectedLabels);
    this.itemsPerPage = props.itemsPerPage;
    this.assignees = [...props.assignees];
  }

  /** Create a default Filter instance. */
  static createDefault(itemsPerPage = 20): Filter {
    return new Filter({
      title: '',
      status: [
        StatusOptions.OpenPullRequests,
        StatusOptions.MergedPullRequests,
        StatusOptions.OpenIssues,
        StatusOptions.ClosedIssues
      ],
      type: TypeOptions.All,
      sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
      labels: [],
      milestones: [],
      hiddenLabels: new Set<string>(),
      deselectedLabels: new Set<string>(),
      itemsPerPage,
      assignees: []
    });
  }

  /**
   * Deserialize from a plain query object (Angular-agnostic).
   * Accepts values as string or string[] (like Router query params).
   */
  static fromQueryObject(query: Record<string, string | string[] | undefined>): Filter {
    const arr = (v: string | string[] | undefined) =>
      Array.isArray(v) ? v : v ? [v] : [];

    const first = (v: string | string[] | undefined) =>
      Array.isArray(v) ? v[0] : v;

    const parseSet = (v: string | string[] | undefined) => new Set(arr(v));

    const sortStr = first(query['sort']);
    const sort = sortStr
      ? (JSON.parse(sortStr) as Sort)
      : { active: SortOptions.Status, direction: OrderOptions.Asc };

    const itemsPerPageStr = first(query['itemsPerPage']);
    const itemsPerPage = itemsPerPageStr ? Number(itemsPerPageStr) : 20;

    return new Filter({
      title: first(query['title']) ?? '',
      status:
        arr(query['status']).length > 0
          ? arr(query['status'])
          : [
              StatusOptions.OpenPullRequests,
              StatusOptions.MergedPullRequests,
              StatusOptions.OpenIssues,
              StatusOptions.ClosedIssues
            ],
      type: first(query['type']) ?? TypeOptions.All,
      sort,
      labels: arr(query['labels']),
      milestones: arr(query['milestones']),
      hiddenLabels: parseSet(query['hiddenLabels']),
      deselectedLabels: parseSet(query['deselectedLabels']),
      itemsPerPage,
      assignees: arr(query['assignees'])
    });
  }

  /** Immutable update that returns a new Filter instance. */
  clone(update: FilterUpdate = {}): Filter {
    return new Filter({
      title: update.title ?? this.title,
      status: update.status ?? this.status,
      type: update.type ?? this.type,
      sort: update.sort ?? this.sort,
      labels: update.labels ?? this.labels,
      milestones: update.milestones ?? this.milestones,
      hiddenLabels: update.hiddenLabels ?? this.hiddenLabels,
      deselectedLabels: update.deselectedLabels ?? this.deselectedLabels,
      itemsPerPage: update.itemsPerPage ?? this.itemsPerPage,
      assignees: update.assignees ?? this.assignees
    });
  }

  /** Serialize to a plain query object suitable for Angular Router. */
  toQueryObject(): Record<string, string | string[]> {
    const q: Record<string, string | string[]> = {};

    const entries: [string, any][] = [
        ['title', this.title],
        ['type', this.type],
        ['status', this.status.length ? this.status : undefined],
        ['labels', this.labels.length ? this.labels : undefined],
        ['milestones', this.milestones.length ? this.milestones : undefined],
        ['assignees', this.assignees.length ? this.assignees : undefined],
        ['hiddenLabels', this.hiddenLabels.size ? [...this.hiddenLabels] : undefined],
        ['deselectedLabels', this.deselectedLabels.size ? [...this.deselectedLabels] : undefined],
        ['sort', JSON.stringify(this.sort)],
        ['itemsPerPage', String(this.itemsPerPage)]
    ];

    for (const [key, value] of entries) {
        if (value !== undefined) {
        q[key] = value;
        }
    }

    return q;
  }
}
