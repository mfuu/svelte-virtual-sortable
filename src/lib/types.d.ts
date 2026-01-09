import type { Group, ScrollSpeed, SortableEvent } from 'sortable-dnd';
import type { Range } from './core';
import type { Snippet } from 'svelte';

export type Getter<T> = () => T;

export type KeyValueType = string | number;

export type EventType = 'onTop' | 'onBottom' | 'onDrag' | 'onDrop' | 'onRangeChange';

export interface DragEvent<T> {
  key: KeyValueType;
  index: number;
  item: T;
  event: SortableEvent;
}

export interface DropEvent<T> {
  key: KeyValueType;
  list: T[];
  item: T;
  oldList: T[];
  event: SortableEvent;
  changed: boolean;
  oldIndex: number;
  newIndex: number;
}

export interface VirtualProps<T> {
  dataKey: string;
  dataSource: T[];

  keeps?: number;
  size?: number;
  group?: Group | string;
  handle?: string;
  lockAxis?: 'x' | 'y';
  scroller?: HTMLElement | Document;
  direction?: 'vertical' | 'horizontal';
  tableMode?: boolean;
  debounceTime?: number;
  throttleTime?: number;

  delay?: number;
  disabled?: boolean;
  sortable?: boolean;
  draggable?: string;
  animation?: number;
  keepOffset?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: ScrollSpeed;
  appendToBody?: boolean;
  scrollThreshold?: number;
  delayOnTouchOnly?: boolean;
  dropOnAnimationEnd?: boolean;

  rootTag?: string;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
  wrapTag?: string;
  wrapStyle?: Partial<CSSStyleDeclaration>;
  wrapClass?: string;
  itemTag?: string;
  itemStyle?: Partial<CSSStyleDeclaration>;
  itemClass?: string;

  ghostStyle?: Partial<CSSStyleDeclaration>;
  ghostClass?: string;
  chosenClass?: string;
  placeholderClass?: string;

  item?: Snippet<[{ item: T; index: number; key: KeyValueType }]>;
  header?: Snippet;
  footer?: Snippet;

  onTop?: () => void;
  onBottom?: () => void;
  onDrag?: (event: DragEvent<T>) => void;
  onDrop?: (event: DropEvent<T>) => void;
  onRangeChange?: (range: Range) => void;
}

export interface ItemProps {
  tag: string;
  style: Partial<CSSStyleDeclaration>;
  className: string;
  horizontal: boolean;
  dataKey: KeyValueType;
  dragging: KeyValueType;
  onResize: (key: KeyValueType, size: number) => void;
  children?: Snippet;
}
