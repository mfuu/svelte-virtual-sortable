<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { cssStringify } from './utils.js';
  import { isEqual } from './core/utils.js';
  import type { ItemProps } from './types.d.ts';

  let { tag, style, className, horizontal, dataKey, dragging, onResize, children }: ItemProps =
    $props();

  let itemRef: HTMLElement | null;
  let observer: ResizeObserver | null;

  const itemStyle = $derived.by(() => {
    const isDragging = isEqual(dragging, dataKey);
    return { ...style, display: isDragging ? 'none' : '' };
  });

  onMount(() => {
    itemRef && itemRef.setAttribute('role', 'item');

    if (typeof ResizeObserver !== undefined) {
      observer = new ResizeObserver(() => {
        const sizeKey = horizontal ? 'offsetWidth' : 'offsetHeight';
        const size = itemRef[sizeKey];
        onResize(dataKey, size);
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
  data-key={dataKey}
>
  {@render children?.()}
</svelte:element>
