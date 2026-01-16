<script>
  import VirtualList from '../../components/virtualList.svelte';
</script>

<VirtualList className="basic-virtual-list">
  {#snippet item({ item, index, key })}
    <div class="item-title">
      <span class="index">#{item.index}</span>
      <span class="handle">☰</span>
    </div>
    <p>{item.desc}</p>
  {/snippet}
</VirtualList>

<style scoped>
  :global(.basic-virtual-list) {
    height: 60vh;
    padding: 5px;
    font-size: 14px;
  }

  .item-title {
    display: flex;
    justify-content: space-between;
  }

  .index {
    float: left;
  }
</style>
