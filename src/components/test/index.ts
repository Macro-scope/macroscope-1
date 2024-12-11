"use client";

import StarCellRenderer, { type StarCell } from "./cells/star-cell";
import SparklineCellRenderer, { type SparklineCell } from "./cells/sparkline-cell";
import TagsCellRenderer, { type TagsCell } from "./cells/tags-cell";
import UserProfileCellRenderer, { type UserProfileCell } from "./cells/user-profile-cell";
import DropdownCellRenderer, { type DropdownCell } from "./cells/dropdown-cell";
// import ArticleCellRenderer from "./cells/article-cell.js";
import type { ArticleCell } from "./cells/article-cell-types";
import RangeCellRenderer, { type RangeCell } from "./cells/range-cell";
import SpinnerCellRenderer, { type SpinnerCell } from "./cells/spinner-cell";
import DatePickerRenderer, { type DatePickerCell } from "./cells/date-picker-cell";
import LinksCellRenderer, { type LinksCell } from "./cells/links-cell";
import ButtonCellRenderer, { type ButtonCell } from "./cells/button-cell";
import TreeViewCellRenderer, { type TreeViewCell } from "./cells/tree-view-cell";
import MultiSelectCellRenderer, { type MultiSelectCell } from "./cells/multi-select-cell";

const cells = [
    StarCellRenderer,
    SparklineCellRenderer,
    TagsCellRenderer,
    UserProfileCellRenderer,
    DropdownCellRenderer,
    // ArticleCellRenderer,
    SpinnerCellRenderer,
    RangeCellRenderer,
    DatePickerRenderer,
    LinksCellRenderer,
    ButtonCellRenderer,
    TreeViewCellRenderer,
    MultiSelectCellRenderer,
];

export {
    StarCellRenderer as StarCell,
    SparklineCellRenderer as SparklineCell,
    TagsCellRenderer as TagsCell,
    UserProfileCellRenderer as UserProfileCell,
    DropdownCellRenderer as DropdownCell,
    // ArticleCellRenderer as ArticleCell,
    RangeCellRenderer as RangeCell,
    SpinnerCellRenderer as SpinnerCell,
    DatePickerRenderer as DatePickerCell,
    LinksCellRenderer as LinksCell,
    ButtonCellRenderer as ButtonCell,
    TreeViewCellRenderer as TreeViewCell,
    MultiSelectCellRenderer as MultiSelectCell,
    cells as allCells,
};

export type {
    StarCell as StarCellType,
    SparklineCell as SparklineCellType,
    TagsCell as TagsCellType,
    UserProfileCell as UserProfileCellType,
    DropdownCell as DropdownCellType,
    // ArticleCell as ArticleCellType,
    RangeCell as RangeCellType,
    SpinnerCell as SpinnerCellType,
    DatePickerCell as DatePickerType,
    LinksCell as LinksCellType,
    ButtonCell as ButtonCellType,
    TreeViewCell as TreeViewCellType,
    MultiSelectCell as MultiSelectCellType,
};