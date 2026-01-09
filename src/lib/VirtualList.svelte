<script lang="ts" generics="T">
  import { onDestroy, onMount, untrack } from 'svelte';
  import {
    debounce,
    getDataKey,
    isEqual,
    SortableAttrs,
    VirtualAttrs,
    VirtualSortable,
    type DragEvent,
    type DropEvent,
    type Options,
    type Range,
    type ScrollEvent,
  } from './core';
  import type { EventType, KeyValueType, VirtualProps } from './types.d.ts';
  import Item from './Item.svelte';
  import { Previous } from './previous.svelte';
  import { cssStringify } from './utils';

  let {
    dataKey = '',
    dataSource = [],
    tableMode = false,

    size = undefined,
    keeps = 30,
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
  }: VirtualProps<T> = $props();

  let VS: VirtualSortable<KeyValueType>;
  let range: Range = $state({ start: 0, end: 0, front: 0, behind: 0 });

  let rootElRef: HTMLElement;
  let wrapElRef: HTMLElement;

  /**
   * Get item size by data-key
   */
  export function getSize(key: KeyValueType) {
    return VS.call('getSize', key);
  }

  /**
   * Get current scroll offset
   */
  export function getOffset() {
    return VS.call('getOffset');
  }
  /**
   * Get client viewport size
   */
  export function getClientSize() {
    return VS.call('getClientSize');
  }

  /**
   * Get scroll size
   */
  export function getScrollSize() {
    return VS.call('getScrollSize');
  }

  /**
   * Scroll to the specified offset
   */
  export function scrollToOffset(offset: number) {
    VS.call('scrollToOffset', offset);
  }

  /**
   * Scroll to the specified index position
   */
  export function scrollToIndex(index: number, align?: 'top' | 'bottom' | 'auto') {
    VS.call('scrollToIndex', index, align);
  }

  /**
   * Scroll to the specified data-key position
   */
  export function scrollToKey(key: KeyValueType, align?: 'top' | 'bottom' | 'auto') {
    const index = uniqueKeys.indexOf(key);
    if (index > -1) {
      VS.call('scrollToIndex', index, align);
    }
  }

  /**
   * Scroll to top of list
   */
  export function scrollToTop() {
    VS.call('scrollToOffset', 0);
  }

  /**
   * Scroll to bottom of list
   */
  export function scrollToBottom() {
    VS.call('scrollToBottom');
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
    VS?.destroy();
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
        VS?.call('scrollToIndex', index);
      }
      listLengthWhenTopLoading = 0;
    }

    lastListLength = dataSource.length;
  }

  function updateUniqueKeys() {
    uniqueKeys = dataSource.map((item) => getDataKey(item, dataKey));
    VS?.option('uniqueKeys', uniqueKeys);
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
      VS?.call('isReachedBottom')
    ) {
      newRange.start++;
    }

    VS?.call('updateRange', newRange);
  }

  const dispatchEvent = (
    name: keyof VirtualProps<T> & EventType,
    ...args: Parameters<NonNullable<VirtualProps<T>[keyof VirtualProps<T> & EventType]>>
  ) => {
    const handler = restProps[name];
    handler && handler.apply(null, args);
  };

  // ========================================== virtual sortable ==========================================
  let dragging: KeyValueType = $state('');
  const attrs = $derived({
    // virtual attrs
    size,
    keeps,
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
  const previousAttrs = new Previous(() => attrs);

  $effect(() => {
    attrs;

    untrack(() => updateVsAttrs());
  });

  function updateVsAttrs() {
    if (!VS) return;

    [...SortableAttrs, ...VirtualAttrs].forEach((attr) => {
      if (previousAttrs.current?.[attr] !== attrs[attr]) {
        VS.option(attr as keyof Options<KeyValueType>, attrs[attr]);
      }
    });
  }

  function installVirtualSortable() {
    const options = [...SortableAttrs, ...VirtualAttrs].reduce((acc, cur) => {
      acc[cur] = attrs[cur];
      return acc;
    }, {} as Options<KeyValueType>);

    VS = new VirtualSortable<KeyValueType>(rootElRef, {
      ...options,
      buffer: Math.round(keeps / 3),
      wrapper: wrapElRef,
      scroller: scroller || rootElRef,
      uniqueKeys: uniqueKeys,
      ghostContainer: wrapElRef,
      onDrag: (event) => onDrag(event),
      onDrop: (event) => onDrop(event),
      onScroll: (event) => onScroll(event),
      onUpdate: (range, changed) => onUpdate(range, changed),
    });
  }

  const handleToTop = debounce(() => {
    listLengthWhenTopLoading = dataSource.length;
    dispatchEvent('onTop');
  }, 50);

  const handleToBottom = debounce(() => {
    dispatchEvent('onBottom');
  }, 50);

  function onScroll(event: ScrollEvent) {
    listLengthWhenTopLoading = 0;
    if (event.top) {
      handleToTop();
    } else if (event.bottom) {
      handleToBottom();
    }
  }

  function onUpdate(newRange: Range, changed: boolean) {
    range = newRange;

    changed && dispatchEvent('onRangeChange', range);
  }

  function onItemResized(key: KeyValueType, size: number) {
    // ignore changes for dragging element
    if (isEqual(key, dragging) || !VS) {
      return;
    }

    const sizes = VS.virtual.sizes.size;
    VS.call('updateItemSize', key, size);

    if (sizes === keeps - 1 && dataSource.length > keeps) {
      VS.call('updateRange', range);
    }
  }

  const onDrag = (event: DragEvent<KeyValueType>) => {
    const { key, index } = event;
    const item = dataSource[index];

    dragging = key;
    (window as any).draggingItem = item as any;

    if (!sortable) {
      VS?.call('enableScroll', false);
      VS?.option('autoScroll', false);
    }

    dispatchEvent('onDrag', { ...event, item });
  };

  const onDrop = (event: DropEvent<KeyValueType>) => {
    const item = (window as any).draggingItem;
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

    VS!.call('enableScroll', true);
    VS!.option('autoScroll', autoScroll);

    dragging = '';

    dispatchEvent('onDrop', { ...event, item, list: newList, oldList });
  };

  // ========================================== layout ==========================================
  const renderItems = $derived(dataSource.slice(range.start, range.end + 1));

  const { rootElStyle, wrapElStyle } = $derived.by(() => {
    const { front, behind } = range;
    const isHorizontal = direction === 'horizontal';

    const overflow = isHorizontal ? 'auto hidden' : 'hidden auto';
    const padding = isHorizontal ? `0px ${behind}px 0px ${front}px` : `${front}px 0px ${behind}px`;

    const rootElStyle = { ...style, overflow: tableMode || scroller ? '' : overflow };
    const wrapElStyle = { ...wrapStyle, padding: tableMode ? '' : padding };

    return {
      rootElStyle,
      wrapElStyle,
    };
  });
</script>

<svelte:element
  this={rootTag}
  bind:this={rootElRef}
  style={cssStringify(rootElStyle)}
  class={className}
>
  {#if headerSnippet}
    {@render headerSnippet()}
  {/if}

  <svelte:element
    this={wrapTag}
    bind:this={wrapElRef}
    class={wrapClass}
    style={cssStringify(wrapElStyle)}
  >
    {#each renderItems as item, index (getDataKey(item, dataKey))}
      <Item
        tag={itemTag}
        style={itemStyle}
        className={itemClass}
        dataKey={getDataKey(item, dataKey)}
        {dragging}
        horizontal={direction === 'horizontal'}
        onResize={onItemResized}
      >
        {@render itemSnippet?.({
          item,
          index: index + range.start,
          key: getDataKey(item, dataKey),
        })}
      </Item>
    {/each}
  </svelte:element>

  {#if footerSnippet}
    {@render footerSnippet()}
  {/if}
</svelte:element>
