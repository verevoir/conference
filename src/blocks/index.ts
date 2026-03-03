import { talk } from './talk';
import { speaker } from './speaker';
import { track } from './track';
import { sponsor } from './sponsor';
import { scheduleSlot } from './schedule-slot';
import { post } from './post';
import { page } from './page';
import { organiser } from './organiser';
import { highlight } from './highlight';
import { feedback } from './feedback';
import { bookmark } from './bookmark';
import { config } from './config';

export {
  talk,
  speaker,
  track,
  sponsor,
  scheduleSlot,
  post,
  page,
  organiser,
  highlight,
  feedback,
  bookmark,
  config,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blocks: Record<string, any> = {
  talk,
  speaker,
  track,
  sponsor,
  'schedule-slot': scheduleSlot,
  post,
  page,
  organiser,
  highlight,
  feedback,
  bookmark,
  config,
};
