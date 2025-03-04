import { Service } from 'typedi';
import { parse } from 'parse5';

// @ts-expect-error
import { indentify } from 'cli-html/lib/utils.js';
// @ts-expect-error
import { getGlobalConfig } from 'cli-html/lib/utils/get-clobal-config.js';
// @ts-expect-error
import { renderTag } from 'cli-html/lib/utils/render-tag.js';

import markdownit from 'markdown-it';
// @ts-expect-error
import markdownItAbbr from 'markdown-it-abbr';
import markdownItContainer from 'markdown-it-container';
// @ts-expect-error
import markdownItDeflist from 'markdown-it-deflist';
import markdownItFootnote from 'markdown-it-footnote';
// @ts-expect-error
import markdownItIns from 'markdown-it-ins';
// @ts-expect-error
import markdownItMark from 'markdown-it-mark';
// @ts-expect-error
import markdownItSub from 'markdown-it-sub';
// @ts-expect-error
import markdownItSup from 'markdown-it-sup';
// @ts-expect-error
import markdownItTaskList from 'markdown-it-task-lists';

export interface MarkdownConvertOptions {
  codeNumbers?: boolean;
}

@Service()
export class MarkdownToTerminal {
  private md: markdownit;

  constructor() {
    this.md = markdownit({
      html: true,
      linkify: true,
      langPrefix: 'language-',
    })
      .use(markdownItAbbr)
      .use(markdownItContainer)
      .use(markdownItDeflist)
      .use(markdownItFootnote)
      .use(markdownItIns)
      .use(markdownItMark)
      .use(markdownItSub)
      .use(markdownItSup)
      .use(markdownItTaskList);
  }

  convert(md: string, options?: MarkdownConvertOptions): string {
    const rawHTML = this.md.render(md);
    const document = parse(rawHTML);

    const globalConfig = getGlobalConfig(document, {});
    if (!options?.codeNumbers) {
      globalConfig.theme.codeNumbers = () => '';
    }

    return `\n${indentify(
      ' ',
      false,
    )((renderTag(document, globalConfig) || { value: '' }).value)}\n\n`;
  }
}
