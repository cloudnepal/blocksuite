import type { EditorHost } from '@blocksuite/block-std';

import { ShadowlessElement, WithDisposable } from '@blocksuite/block-std';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import type { ChatAction } from '../chat-context.js';

import { renderImages } from '../components/images.js';
import './action-wrapper.js';

@customElement('action-image-to-text')
export class ActionImageToText extends WithDisposable(ShadowlessElement) {
  protected override render() {
    const answer = this.item.messages[1].attachments;

    return html`<action-wrapper .host=${this.host} .item=${this.item}>
      <div style=${styleMap({ marginBottom: '12px' })}>
        ${answer ? renderImages(answer) : nothing}
      </div>
    </action-wrapper>`;
  }

  @property({ attribute: false })
  accessor host!: EditorHost;

  @property({ attribute: false })
  accessor item!: ChatAction;
}

declare global {
  interface HTMLElementTagNameMap {
    'action-image-to-text': ActionImageToText;
  }
}
