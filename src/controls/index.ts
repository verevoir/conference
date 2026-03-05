import { heading } from './heading';
import { paragraph } from './paragraph';
import { image } from './image';
import { quote } from './quote';
import { cta } from './cta';
import type { ContentControl } from './types';

export type { ContentControl, ContentBlock } from './types';

export const controls: Record<string, ContentControl> = {
  heading,
  paragraph,
  image,
  quote,
  cta,
};

export const controlList: ContentControl[] = Object.values(controls);
