import type { BlockSpec } from '@blocksuite/block-std';

import { EdgelessTextBlockSchema } from '@blocksuite/affine-model';
import { literal } from 'lit/static-html.js';

import { commands } from './commands/index.js';
import { EdgelessTextBlockService } from './edgeless-text-service.js';

export const EdgelessTextBlockSpec: BlockSpec = {
  schema: EdgelessTextBlockSchema,
  view: {
    component: literal`affine-edgeless-text`,
  },
  commands,
  service: EdgelessTextBlockService,
};