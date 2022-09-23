import type { Quill, RangeStatic } from 'quill';
import type { BaseBlockModel, Store } from '@building-blocks/store';
import { TextBlockProps } from '../..';
import IQuillRange from 'quill-cursors/dist/quill-cursors/i-range';

interface BindingContext {
  collapsed: boolean;
  empty: boolean;
  offset: number;
  prefix: string;
  suffix: string;
  format: Record<string, unknown>;
}

type KeyboardBindings = Record<
  string,
  {
    key: string | number;
    handler: KeyboardBindingHandler;
    prefix?: RegExp;
    suffix?: RegExp;
    shortKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    ctrlKey?: boolean;
  }
>;

interface KeyboardEventThis {
  quill: Quill;
  options: {
    bindings: KeyboardBindings;
  };
}

type KeyboardBindingHandler = (
  this: KeyboardEventThis,
  range: RangeStatic,
  context: BindingContext
) => void;

export const createKeyboardBindings = (store: Store, model: BaseBlockModel) => {
  const clientID = store.doc.clientID;

  function undo() {
    store.undo();
  }

  function redo() {
    store.redo();
  }

  function hardEnter(this: KeyboardEventThis) {
    const isAtBlockEnd =
      this.quill.getLength() - 1 === this.quill.getSelection()?.index;
    if (isAtBlockEnd) {
      const blockProps: Partial<TextBlockProps> = {
        flavour: 'text',
        text: '',
      };
      // make adding text block by enter a standalone operation
      store.captureSync();
      const id = store.addBlock(blockProps);
      setTimeout(() => {
        store.textAdapters.get(id)?.quill.focus();
      });
    }
  }

  function softEnter(this: KeyboardEventThis) {
    const index = this.quill.getSelection()?.index || 0;
    // @ts-ignore
    this.quill.insertText(index, '\n', clientID);
  }

  function indent(this: KeyboardEventThis) {
    const previousSibling = store.getPreviousSibling(model);
    if (previousSibling) {
      store.captureSync();
      store.deleteBlock(model);
      store.addBlock(model, previousSibling);
    }
  }

  function unindent(this: KeyboardEventThis) {
    const parent = store.getParent(model);
    if (!parent) return;

    const grandParent = store.getParent(parent);
    if (!grandParent) return;

    const index = grandParent.children.indexOf(parent);
    store.captureSync();
    store.deleteBlock(model);
    store.addBlock(model, grandParent, index + 1);
  }

  function keyup(this: KeyboardEventThis, range: IQuillRange, ) { 
    if (range.index >= 0) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        const { top, left, height } = range.getBoundingClientRect();
        // TODO resolve compatible problem
        const newRange = document.caretRangeFromPoint(left, top - height / 2);
        if (!newRange || !this.quill.root.contains(newRange.startContainer)) {
          console.log('should move out');
          return false;
        }
      }
    }
    return true;
  }

  function keydown(this: KeyboardEventThis, range: IQuillRange ) {
    if (range.index >= 0) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        const { bottom, left, height } = range.getBoundingClientRect();
        // TODO resolve compatible problem
        const newRange = document.caretRangeFromPoint(left, bottom + height / 2);
        if (!newRange || !this.quill.root.contains(newRange.startContainer)) {
          console.log('should move out');
          return false;
        }
      }
    }
    return true;
  }

  const keyboardBindings: KeyboardBindings = {
    undo: {
      key: 'z',
      shortKey: true,
      handler: undo,
    },
    redo: {
      key: 'z',
      shiftKey: true,
      shortKey: true,
      handler: redo,
    },
    hardEnter: {
      key: 'enter',
      handler: hardEnter,
    },
    softEnter: {
      key: 'enter',
      shiftKey: true,
      handler: softEnter,
    },
    tab: {
      key: 'tab',
      handler: indent,
    },
    shiftTab: {
      key: 'tab',
      shiftKey: true,
      handler: unindent,
    },
    up: {
      key: 'up',
      shiftKey: false,
      handler: keyup,
    },
    down: {
      key: 'down',
      shiftKey: false,
      handler: keydown,
    },
  };

  return keyboardBindings;
};
