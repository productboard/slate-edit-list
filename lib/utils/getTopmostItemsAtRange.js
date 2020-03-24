// @flow
import { Range, NodeEntry, Editor, Path, Node } from 'slate';
import { type Options } from '..';
import { getCurrentItem, isItem, isList } from '.';

/**
 * Return the array of items at the given range. The returned items are
 * the highest list item blocks that cover the range.
 *
 * Returns an empty array if no list of items can cover the range
 */
export const getTopmostItemsAtRange = (options: Options) => (
    editor: Editor,
    range?: Range
): Array<NodeEntry<Element>> => {
    range = range || editor.selection;

    if (!range) {
        return [];
    }

    const [startElement, startElementPath] = Editor.parent(
        editor,
        Range.start(range)
    );
    const [endElement, endElementPath] = Editor.parent(
        editor,
        Range.end(range)
    );

    if (startElement === endElement) {
        const item = getCurrentItem(options)(editor, startElementPath);
        return item ? [item] : [];
    }

    const ancestorPath = Path.common(startElementPath, endElementPath);
    const ancestor = Node.get(editor, ancestorPath);

    if (isList(options)(ancestor)) {
        return [
            ...Editor.nodes(editor, {
                at: range,
                match: isItem(options),
            }),
            // We want only the children of the ancestor
            // aka the topmost possible list items in the selection
        ].filter(
            ([, listItemPath]) =>
                listItemPath.length === ancestorPath.length + 1
        );
    } else if (isItem(options)(ancestor)) {
        // The ancestor is the highest list item that covers the range
        return [[ancestor, ancestorPath]];
    }
    // No list of items can cover the range
    return [];
};