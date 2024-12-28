import {
  type CustomCell,
  type Rectangle,
  measureTextCached,
  type CustomRenderer,
  getMiddleCenterBias,
  GridCellKind,
} from "@glideapps/glide-data-grid";
import { styled } from "styled-components";
import * as React from "react";
import { roundedRect } from "../draw-fns";

interface CategoriesCellProps {
  readonly kind: "categories-cell";
  readonly categories: readonly string[];
  readonly possibleCategories: readonly {
    category: string;
    color: string;
  }[];
}

export type CategoriesCell = CustomCell<CategoriesCellProps>;

const categoryHeight = 20; // Changed variable name
const innerPad = 6;

const EditorWrap = styled.div<{
  categoryHeight: number;
  innerPad: number;
}>`  // Updated prop name
    // ... (styles remain the same, just update references from tag to category)
    border-radius: var(--gdg-rounding-radius, ${(p) => p.categoryHeight / 2}px);
    min-height: ${(p) => p.categoryHeight}px);
    // ... rest of the styles remain the same
`;

const renderer: CustomRenderer<CategoriesCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is CategoriesCell =>
    (c.data as any).kind === "categories-cell",
  draw: (args, cell) => {
    const { ctx, theme, rect } = args;
    const { possibleCategories, categories } = cell.data; // Changed variable names

    const drawArea: Rectangle = {
      x: rect.x + theme.cellHorizontalPadding,
      y: rect.y + theme.cellVerticalPadding,
      width: rect.width - 2 * theme.cellHorizontalPadding,
      height: rect.height - 2 * theme.cellVerticalPadding,
    };
    const rows = Math.max(
      1,
      Math.floor(drawArea.height / (categoryHeight + innerPad))
    );

    let x = drawArea.x;
    let row = 1;
    let y =
      drawArea.y +
      (drawArea.height - rows * categoryHeight - (rows - 1) * innerPad) / 2;
    for (const category of categories) {
      const color =
        possibleCategories.find((t) => t.category === category)?.color ??
        theme.bgBubble;

      ctx.font = `12px ${theme.fontFamily}`;
      const metrics = measureTextCached(category, ctx);
      const width = metrics.width + innerPad * 2;
      const textY = categoryHeight / 2;

      if (
        x !== drawArea.x &&
        x + width > drawArea.x + drawArea.width &&
        row < rows
      ) {
        row++;
        y += categoryHeight + innerPad;
        x = drawArea.x;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      roundedRect(
        ctx,
        x,
        y,
        width,
        categoryHeight,
        theme.roundingRadius ?? categoryHeight / 2
      );
      ctx.fill();

      ctx.fillStyle = theme.textDark;
      ctx.fillText(
        category,
        x + innerPad,
        y + textY + getMiddleCenterBias(ctx, `12px ${theme.fontFamily}`)
      );

      x += width + 8;
      if (x > drawArea.x + drawArea.width && row >= rows) break;
    }

    return true;
  },
  provideEditor: () => {
    return (p) => {
      const { onChange, value } = p;
      const { readonly = false } = value;
      const { possibleCategories, categories } = value.data; // Changed variable names
      return (
        <EditorWrap
          categoryHeight={categoryHeight}
          innerPad={innerPad}
          className={readonly ? "gdg-readonly" : ""}
        >
          {possibleCategories.map((t) => {
            const selected = categories.indexOf(t.category) !== -1; // Changed from t.tag
            return (
              <label key={t.category}>
                {" "}
                {/* Changed from t.tag */}
                {!readonly && (
                  <input
                    className="gdg-input"
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const newCategories = selected
                        ? categories.filter((x) => x !== t.category)
                        : [...categories, t.category];
                      onChange({
                        ...p.value,
                        data: {
                          ...value.data,
                          categories: newCategories,
                        },
                      });
                    }}
                  />
                )}
                <div
                  className={
                    "gdg-pill " + (selected ? "gdg-selected" : "gdg-unselected")
                  }
                  style={{ backgroundColor: selected ? t.color : undefined }}
                >
                  {t.category} {/* Changed from t.tag */}
                </div>
              </label>
            );
          })}
        </EditorWrap>
      );
    };
  },
  onPaste: (v, d) => ({
    ...d,
    categories: d.possibleCategories
      .map((x) => x.category) // Changed from x.tag
      .filter((x) =>
        v
          .split(",")
          .map((s) => s.trim())
          .includes(x)
      ),
  }),
};

export default renderer;
