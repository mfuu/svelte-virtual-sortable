<script>
  import VirtualList from '../../components/virtualList.svelte';
</script>

<div class="group">
  <VirtualList group="g" className="group-virtual-list">
    {#snippet item({ item, index, key })}
      <div class="item-title">
        <span class="index">#{item.index}</span>
        <span class="handle">☰</span>
      </div>
    {/snippet}
  </VirtualList>

  <VirtualList group="g" className="group-virtual-list">
    {#snippet item({ item, index, key })}
      <div class="item-title">
        <span class="index">#{item.index}</span>
        <span class="handle">☰</span>
      </div>
    {/snippet}
  </VirtualList>
</div>

<style scoped>
  .group {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    height: 60vh;
    padding: 5px;
  }

  .item-title {
    display: flex;
    justify-content: space-between;
  }

  .index {
    float: left;
  }

  :global(.group-virtual-list) {
    width: 49%;
    height: 100%;
  }
</style>
