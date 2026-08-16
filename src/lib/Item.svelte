<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { cssStringify } from './utils.js';
  import { isEqual } from './core/utils.js';
  import type { ListItemProps } from './types.d.ts';

  let {
    tag,
    style,
    className,
    isHorizontal,
    itemKey,
    dragging,
    onResize,
    children,
  }: ListItemProps = $props();

  let itemRef: HTMLElement | null;
  let observer: ResizeObserver | null;

  const itemStyle = $derived.by(() => {
    const isDragging = isEqual(dragging, itemKey);
    return { ...style, display: isDragging ? 'none' : '' };
  });

  onMount(() => {
    itemRef && itemRef.setAttribute('role', 'item');

    if (typeof ResizeObserver !== undefined) {
      observer = new ResizeObserver(() => {
        const sizeKey = isHorizontal ? 'offsetWidth' : 'offsetHeight';
        const size = itemRef[sizeKey];
        onResize(itemKey, size);
      });
      itemRef && observer?.observe(itemRef);
    }
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });
</script>

<svelte:element
  this={tag}
  bind:this={itemRef}
  style={cssStringify(itemStyle)}
  class={className}
  data-key={itemKey}
>
  {@render children?.()}
</svelte:element>
