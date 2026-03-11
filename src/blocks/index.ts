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
import { talkProposal } from './talk-proposal';
import { vote } from './vote';
import { ticketBatch } from './ticket-batch';
import { ticketBooking } from './ticket-booking';
import { swagProduct } from './swag-product';
import { swagOrder } from './swag-order';

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
  talkProposal,
  vote,
  ticketBatch,
  ticketBooking,
  swagProduct,
  swagOrder,
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
  'talk-proposal': talkProposal,
  vote,
  'ticket-batch': ticketBatch,
  'ticket-booking': ticketBooking,
  'swag-product': swagProduct,
  'swag-order': swagOrder,
};
