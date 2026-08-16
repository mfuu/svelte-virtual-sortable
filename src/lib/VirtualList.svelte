<script lang="ts" generics="T">
  import { onDestroy, onMount, untrack } from 'svelte';
  import Sortable from 'sortable-dnd';
  import {
    CoreService,
    debounce,
    getDataKey,
    isEqual,
    SortableAttrs,
    VirtualAttrs,
    type CoreOptions,
    type DragEvent,
    type DropEvent,
    type Range,
    type ScrollEvent,
  } from './core';
  import type { EventType, KeyValueType, VirtualListProps } from './types.d.ts';
  import Tr from './Tr.svelte';
  import Item from './Item.svelte';
  import { Previous } from './previous.svelte';
  import { cssStringify } from './utils';

  let {
    dataKey = '',
    dataSource = [],
    tableMode = false,

    size = undefined,
    keeps = 30,
    buffer = undefined,
    scroller = undefined,
    direction = 'vertical',
    debounceTime = 0,
    throttleTime = 0,
    keepOffset = false,

    delay = 0,
    group = '',
    handle = '',
    lockAxis = undefined,
    disabled = false,
    sortable = true,
    draggable = '[role="item"]',
    animation = 150,
    autoScroll = true,
    scrollSpeed = { x: 10, y: 10 },
    ghostClass = '',
    ghostStyle = {},
    chosenClass = '',
    placeholderClass = '',
    appendToBody = false,
    scrollThreshold = 55,
    delayOnTouchOnly = false,
    dropOnAnimationEnd = true,

    wrapTag = 'div',
    rootTag = 'div',
    itemTag = 'div',

    style = {},
    className = '',
    wrapStyle = {},
    wrapClass = '',
    itemStyle = {},
    itemClass = '',

    item: itemSnippet,
    header: headerSnippet,
    footer: footerSnippet,

    ...restProps
  }: VirtualListProps<T> = $props();

  let core: CoreService<KeyValueType>;
  let range: Range = $state({ start: 0, end: 0, front: 0, behind: 0 });
  let dragging: KeyValueType = $state('');

  let rootElRef: HTMLElement;
  let wrapElRef: HTMLElement;

  /**
   * Get item size by data-key
   */
  export function getSize(key: KeyValueType) {
    return core.virtual.getSize(key);
  }

  /**
   * Get current scroll offset
   */
  export function getOffset() {
    return core.virtual.getOffset();
  }
  /**
   * Get client viewport size
   */
  export function getClientSize() {
    return core.virtual.getClientSize();
  }

  /**
   * Get scroll size
   */
  export function getScrollSize() {
    return core.virtual.getScrollSize();
  }

  /**
   * Scroll to the specified offset
   */
  export function scrollToOffset(offset: number) {
    core.virtual.scrollToOffset(offset);
  }

  /**
   * Scroll to the specified index position
   */
  export function scrollToIndex(index: number, align?: 'top' | 'bottom' | 'auto') {
    core.virtual.scrollToIndex(index, align);
  }

  /**
   * Scroll to the specified data-key position
   */
  export function scrollToKey(key: KeyValueType, align?: 'top' | 'bottom' | 'auto') {
    const index = uniqueKeys.indexOf(key);
    if (index > -1) {
      core.virtual.scrollToIndex(index, align);
    }
  }

  /**
   * Scroll to top of list
   */
  export function scrollToTop() {
    core.virtual.scrollToOffset(0);
  }

  /**
   * Scroll to bottom of list
   */
  export function scrollToBottom() {
    core.virtual.scrollToBottom();
  }

  // ========================================== data update ==========================================
  let uniqueKeys: KeyValueType[] = [];
  let lastListLength: number = 0;
  let listLengthWhenTopLoading: number = 0;

  onMount(() => {
    range.end = keeps - 1;

    onDataSourceUpdate();
    installVirtualSortable();
  });

  onDestroy(() => {
    core?.destroy();
  });

  $effect(() => {
    dataSource;

    untrack(() => onDataSourceUpdate());
  });

  function onDataSourceUpdate() {
    updateUniqueKeys();
    detectRangeChange(lastListLength, dataSource.length);

    // if auto scroll to the last offset
    if (listLengthWhenTopLoading && keepOffset) {
      const index = dataSource.length - listLengthWhenTopLoading;
      if (index > 0) {
        core?.virtual.scrollToIndex(index);
      }
      listLengthWhenTopLoading = 0;
    }

    lastListLength = dataSource.length;
  }

  function getItemKey(item: T) {
    if (typeof dataKey === 'function') {
      return dataKey(item);
    }

    return getDataKey(item, dataKey);
  }

  function updateUniqueKeys() {
    const len = dataSource.length;
    const keys = new Array(len);

    for (let i = 0; i < len; i++) {
      keys[i] = getItemKey(dataSource[i]);
    }

    uniqueKeys = keys;
    core?.option('uniqueKeys', uniqueKeys);
  }

  function detectRangeChange(oldListLength: number, newListLength: number) {
    if (oldListLength === newListLength) {
      return;
    }

    let newRange = { ...range };
    if (
      oldListLength > keeps &&
      newListLength > oldListLength &&
      newRange.end === oldListLength - 1 &&
      core?.virtual.isReachedBottom()
    ) {
      newRange.start++;
    }

    core?.virtual.updateRange(newRange);
  }

  const dispatchEvent = (
    name: keyof VirtualListProps<T> & EventType,
    ...args: Parameters<NonNullable<VirtualListProps<T>[keyof VirtualListProps<T> & EventType]>>
  ) => {
    const handler = restProps[name];
    handler && handler.apply(null, args);
  };

  // ========================================== virtual sortable ==========================================
  const coreAttrsKeys = [...SortableAttrs, ...VirtualAttrs];
  const coreAttrs = $derived({
    // virtual attrs
    size,
    keeps,
    buffer,
    scroller,
    direction,
    debounceTime,
    throttleTime,
    // sortable attrs
    delay,
    group,
    handle,
    lockAxis,
    disabled,
    sortable,
    draggable,
    animation,
    autoScroll,
    ghostClass,
    ghostStyle,
    chosenClass,
    scrollSpeed,
    appendToBody,
    scrollThreshold,
    delayOnTouchOnly,
    placeholderClass,
    dropOnAnimationEnd,
  });
  const previousCoreAttrs = new Previous(() => coreAttrs);

  $effect(() => {
    coreAttrs;

    untrack(() => updateCoreAttrs());
  });

  function updateCoreAttrs() {
    if (!core) return;

    coreAttrsKeys.forEach((attr) => {
      if (previousCoreAttrs.current?.[attr] !== coreAttrs[attr]) {
        core?.option(attr as keyof CoreOptions<KeyValueType>, coreAttrs[attr]);
      }
    });
  }

  function installVirtualSortable() {
    const options = coreAttrsKeys.reduce((acc, cur) => {
      acc[cur] = coreAttrs[cur];
      return acc;
    }, {} as CoreOptions<KeyValueType>);

    core = new CoreService<KeyValueType>(rootElRef, {
      ...options,
      wrapper: wrapElRef,
      scroller: scroller || rootElRef,
      uniqueKeys: uniqueKeys,
      ghostContainer: wrapElRef,
      onDrag: (event) => handleDrag(event),
      onDrop: (event) => handleDrop(event),
      onScroll: (event) => handleScroll(event),
      onUpdate: (range, changed) => handleUpdate(range, changed),
    });
  }

  const handleToTop = debounce(() => {
    listLengthWhenTopLoading = dataSource.length;
    dispatchEvent('onTop');
  }, 50);

  const handleToBottom = debounce(() => {
    dispatchEvent('onBottom');
  }, 50);

  function handleScroll(event: ScrollEvent) {
    dispatchEvent('onScroll', event);

    listLengthWhenTopLoading = 0;
    if (event.top) {
      handleToTop();
    } else if (event.bottom) {
      handleToBottom();
    }
  }

  function handleUpdate(newRange: Range, changed: boolean) {
    range = newRange;

    changed && dispatchEvent('onRangeChange', range);
  }

  function onItemResized(key: KeyValueType, size: number) {
    // ignore changes for dragging element
    if (isEqual(key, dragging) || !core) {
      return;
    }

    const sizes = core?.virtual.sizes.size;
    core?.virtual.updateItemSize(key, size);

    if (sizes === keeps - 1 && dataSource.length > keeps) {
      core?.virtual.updateRange(range);
    }
  }

  function handleDrag(event: DragEvent<KeyValueType>) {
    const { key, index } = event;
    const item = dataSource[index];

    dragging = key;
    Sortable.store.draggingItem = item as any;

    dispatchEvent('onDrag', { ...event, item });
  }

  function handleDrop(event: DropEvent<KeyValueType>) {
    const item = Sortable.store.draggingItem;
    const { oldIndex, newIndex } = event;

    const oldList = [...dataSource];
    const newList = [...dataSource];

    if (oldIndex === -1) {
      newList.splice(newIndex, 0, item);
    } else if (newIndex === -1) {
      newList.splice(oldIndex, 1);
    } else {
      newList.splice(oldIndex, 1);
      newList.splice(newIndex, 0, item);
    }

    dragging = '';

    dispatchEvent('onDrop', { ...event, item, list: newList, oldList });
  }

  // ========================================== layout ==========================================
  const isHorizontal = $derived(direction === 'horizontal');

  const renderItems = $derived(
    dataSource.slice(range.start, range.end + 1).map((item, i) => ({
      item,
      index: i + range.start,
      key: getItemKey(item),
    }))
  );

  const { itemElTag, wrapElTag, rootElTag } = $derived({
    itemElTag: tableMode ? 'tr' : itemTag,
    wrapElTag: tableMode ? 'tbody' : wrapTag,
    rootElTag: tableMode ? 'table' : rootTag,
  });

  const { rootElStyle, wrapElStyle } = $derived.by(() => {
    const { front, behind } = range;

    const padding = isHorizontal ? `0px ${behind}px 0px ${front}px` : `${front}px 0px ${behind}px`;
    const overflow = isHorizontal ? 'auto hidden' : 'hidden auto';

    const rootElStyle = { ...style, overflow: tableMode || scroller ? '' : overflow };
    const wrapElStyle = { ...wrapStyle, padding: tableMode ? '' : padding };

    return {
      rootElStyle,
      wrapElStyle,
    };
  });
</script>

<svelte:element
  this={rootElTag}
  bind:this={rootElRef}
  style={cssStringify(rootElStyle)}
  class={className}
>
  {#if headerSnippet}
    {@render headerSnippet()}
  {/if}

  <svelte:element
    this={wrapElTag}
    bind:this={wrapElRef}
    class={wrapClass}
    style={cssStringify(wrapElStyle)}
  >
    {#if tableMode}
      <Tr offset={range.front} {isHorizontal} />
    {/if}
    {#each renderItems as { item, index, key } (key)}
      <Item
        tag={itemElTag}
        style={itemStyle}
        className={itemClass}
        itemKey={key}
        {dragging}
        {isHorizontal}
        onResize={onItemResized}
      >
        {@render itemSnippet?.({ item, index, key })}
      </Item>
    {/each}
    {#if tableMode}
      <Tr offset={range.behind} {isHorizontal} />
    {/if}
  </svelte:element>

  {#if footerSnippet}
    {@render footerSnippet()}
  {/if}
</svelte:element>
