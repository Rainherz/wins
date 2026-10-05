import { marked, type Token, type Tokens } from 'marked';
import { Fragment, type ReactNode } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { radius, spacing, type } from '@/shared/theme/tokens';
import { useTheme } from '@/shared/theme/ThemeProvider';
import type { Colors } from '@/shared/theme/tokens';
import { Text } from './Text';

type Props = {
  source: string;
  /** Where relative links point to, for example "https://github.com/owner/repo/blob/HEAD/". */
  baseUrl?: string;
};

type Ctx = { colors: Colors; baseUrl?: string };

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });
const BODY = { ...type.bodySmall, lineHeight: 22 } as const;

/** marked escapes HTML in text tokens; the UI shows plain text, so undo it. */
const unescape = (text: string) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/** Only web links and mail are opened. Relative links are resolved against the repository. */
function resolveHref(href: string, baseUrl?: string): string | null {
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (!baseUrl || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

/** Plain text of some inline tokens. Used to skip paragraphs that only hold images or HTML. */
function plainText(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'image' || token.type === 'html') return '';
      if ('tokens' in token && Array.isArray(token.tokens)) return plainText(token.tokens);
      return 'text' in token && typeof token.text === 'string' ? token.text : '';
    })
    .join('')
    .trim();
}

function renderInline(tokens: Token[], ctx: Ctx, key: string): ReactNode[] {
  const { colors } = ctx;

  return tokens.map((token, index) => {
    const k = `${key}.${index}`;
    switch (token.type) {
      case 'text':
      case 'escape': {
        const node = token as Tokens.Text;
        if (node.tokens?.length) return <Fragment key={k}>{renderInline(node.tokens, ctx, k)}</Fragment>;
        return unescape(node.text);
      }
      case 'strong':
        return (
          <Text key={k} style={{ fontWeight: '700' }}>
            {renderInline((token as Tokens.Strong).tokens, ctx, k)}
          </Text>
        );
      case 'em':
        return (
          <Text key={k} style={{ fontStyle: 'italic' }}>
            {renderInline((token as Tokens.Em).tokens, ctx, k)}
          </Text>
        );
      case 'del':
        return (
          <Text key={k} style={{ textDecorationLine: 'line-through' }}>
            {renderInline((token as Tokens.Del).tokens, ctx, k)}
          </Text>
        );
      case 'codespan':
        return (
          <Text key={k} style={[styles.codespan, { fontFamily: MONO, backgroundColor: colors.surfaceMuted, color: colors.text }]}>
            {` ${unescape((token as Tokens.Codespan).text)} `}
          </Text>
        );
      case 'link': {
        const link = token as Tokens.Link;
        const href = resolveHref(link.href, ctx.baseUrl);
        const label = renderInline(link.tokens, ctx, k);
        // A link that wraps only an image (a badge) has nothing to show.
        if (!plainText(link.tokens)) return null;
        return href ? (
          <Text
            key={k}
            accessibilityRole="link"
            onPress={() => Linking.openURL(href)}
            style={{ color: colors.accentStrong, textDecorationLine: 'underline' }}>
            {label}
          </Text>
        ) : (
          <Text key={k}>{label}</Text>
        );
      }
      case 'br':
        return '\n';
      case 'image':
      case 'html':
        return null;
      default:
        return 'text' in token && typeof token.text === 'string' ? unescape(token.text) : null;
    }
  });
}

function renderBlocks(tokens: Token[], ctx: Ctx, key: string): ReactNode[] {
  const { colors } = ctx;

  return tokens.map((token, index) => {
    const k = `${key}.${index}`;
    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading;
        const style = heading.depth === 1 ? type.title : heading.depth === 2 ? type.heading : { ...type.body, fontWeight: '600' as const };
        if (!plainText(heading.tokens)) return null;
        return (
          <Text key={k} style={[style, { color: colors.text }, styles.heading]}>
            {renderInline(heading.tokens, ctx, k)}
          </Text>
        );
      }
      case 'paragraph':
      case 'text': {
        const node = token as Tokens.Paragraph;
        const inline = node.tokens ?? [];
        if (!plainText(inline)) return null;
        return (
          <Text key={k} style={[BODY, { color: colors.text }]}>
            {renderInline(inline, ctx, k)}
          </Text>
        );
      }
      case 'list': {
        const list = token as Tokens.List;
        return (
          <View key={k} style={styles.list}>
            {list.items.map((item, i) => (
              <View key={`${k}.${i}`} style={styles.item}>
                <Text style={[BODY, styles.marker, { color: colors.textMuted }]}>
                  {list.ordered ? `${Number(list.start || 1) + i}.` : '•'}
                </Text>
                <View style={styles.itemBody}>{renderBlocks(item.tokens, ctx, `${k}.${i}`)}</View>
              </View>
            ))}
          </View>
        );
      }
      case 'blockquote':
        return (
          <View key={k} style={[styles.quote, { backgroundColor: colors.surfaceMuted }]}>
            {renderBlocks((token as Tokens.Blockquote).tokens, ctx, k)}
          </View>
        );
      case 'code':
        return (
          <View key={k} style={[styles.code, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.codeText, { fontFamily: MONO, color: colors.text }]} selectable>
              {(token as Tokens.Code).text}
            </Text>
          </View>
        );
      case 'table': {
        const table = token as Tokens.Table;
        const rows = [table.header, ...table.rows];
        return (
          <View key={k} style={[styles.table, { borderColor: colors.border }]}>
            {rows.map((row, r) => (
              <View key={`${k}.${r}`} style={[styles.row, r > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                {row.map((cell, c) => (
                  <View key={`${k}.${r}.${c}`} style={styles.cell}>
                    <Text style={[type.caption, { color: colors.text, fontWeight: r === 0 ? '700' : '400' }]}>
                      {renderInline(cell.tokens, ctx, `${k}.${r}.${c}`)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      }
      case 'hr':
        return <View key={k} style={[styles.hr, { backgroundColor: colors.border }]} />;
      default:
        // html blocks, spaces and anything else are not drawn.
        return null;
    }
  });
}

/**
 * Draws Markdown with the app's own components. Raw HTML and images are skipped on purpose:
 * READMEs often open with centered logos and badges that would show as broken markup.
 */
export function Markdown({ source, baseUrl }: Props) {
  const { colors } = useTheme();
  return <View style={styles.root}>{renderBlocks(marked.lexer(source), { colors, baseUrl }, 'md')}</View>;
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  heading: { marginTop: spacing.sm },
  codespan: { fontSize: 13, borderRadius: 4 },
  list: { gap: spacing.xs },
  item: { flexDirection: 'row', gap: spacing.sm },
  marker: { minWidth: 18 },
  itemBody: { flex: 1, gap: spacing.xs },
  quote: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  code: { borderRadius: radius.md, padding: spacing.md },
  codeText: { fontSize: 13, lineHeight: 19 },
  table: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, padding: spacing.sm },
  hr: { height: 1 },
});
