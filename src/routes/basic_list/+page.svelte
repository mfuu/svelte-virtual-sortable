<script>
  import { onMount } from 'svelte';
  import { getPageData } from '../sentence';

  let mounted = false;
  let VirtualList;

  onMount(async () => {
    VirtualList = (await import('$lib')).default;

    mounted = true;
  });

  let items = getPageData(1000, 0);

  function onDrop(event) {
    console.log('onDrop', event);
    items = event.list;
  }
</script>

<div class="vs">
  {#if mounted}
    <VirtualList
      dataSource={items}
      dataKey="id"
      handle=".handle"
      style={{ height: '60vh' }}
      itemClass="list-item"
      onDrop={onDrop}
    >
      {#snippet item({ item, index, key })}
        <div class="item-title">
          <span class="index">#{item.index}</span>
          <span class="handle">☰</span>
        </div>
        <p>{item.desc}</p>
      {/snippet}
    </VirtualList>
  {/if}
</div>

<style>
  .vs {
    height: 300px;
  }

  .vs :global(.virtual-scroll-item) {
    padding: 4px 0;
  }
</style>
