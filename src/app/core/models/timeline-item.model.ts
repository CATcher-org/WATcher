export type TimelineTime = {
  starting_time: number;
  ending_time: number;
  display?: string; // circle/rect
  id?: number;
};

export type TimelineItem = {
  times: TimelineTime[];
  label?: string;
  icon?: string; // path to image
};
