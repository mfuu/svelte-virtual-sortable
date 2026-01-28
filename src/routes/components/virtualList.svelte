<script lang="ts">
  import { onMount } from 'svelte';
  import { getPageData, type DataItem } from '../sentence';
  import type { DropEvent, VirtualProps } from '$lib/types';

  let {
    itemClass,
    item: itemSnippet,
    header: headerSnippet,
    footer: footerSnippet,
    ...restProps
  }: Partial<VirtualProps<DataItem>> = $props();

  let mounted = $state(false);
  let VirtualList = $state(null);

  onMount(async () => {
    VirtualList = (await import('$lib')).default;

    mounted = true;
  });

  let items = $state(getPageData(1000, 0));

  function onDrop(event: DropEvent<DataItem>) {
    console.log('onDrop', event);
    items = event.list;
  }
</script>

{#if mounted}
  <VirtualList
    dataSource={items}
    dataKey="id"
    handle=".handle"
    itemClass={itemClass || 'list-item'}
    chosenClass="chosen"
    {...restProps}
    {onDrop}
  >
    {#snippet header()}
      {#if headerSnippet}
        {@render headerSnippet()}
      {/if}
    {/snippet}

    {#snippet item({ item, index, key })}
      {@render itemSnippet({ item, index, key })}
    {/snippet}

    {#snippet footer()}
      {#if footerSnippet}
        {@render footerSnippet()}
      {/if}
    {/snippet}
  </VirtualList>
{/if}

<style scoped>
  :global(.list-item) {
    position: relative;
    border-radius: 5px;
    box-shadow: 0px 2px 10px -5px #57bbb4;
    padding: 16px;
  }

  :global(.chosen) {
    box-shadow: 0px 0px 0px 2px #306aa4;
  }

  :global(.handle) {
    cursor: grab;
    text-align: right;
  }
</style>
