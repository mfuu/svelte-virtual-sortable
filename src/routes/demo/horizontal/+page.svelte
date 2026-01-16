<script>
  import VirtualList from '../../components/virtualList.svelte';
</script>

<VirtualList
  direction="horizontal"
  className="horizontal-virtual-list"
  itemClass="horizontal-list-item"
  wrapClass="horizontal-list-wrap"
>
  {#snippet item({ item, index, key })}
    <div class="item-title">
      <span class="index">#{item.index}</span>
      <span class="handle">☰</span>
    </div>
    <p>{item.desc}</p>
  {/snippet}
</VirtualList>

<style scoped>
  :global(.horizontal-virtual-list) {
    display: flex;
    height: 60vh;
    padding: 5px;
    font-size: 14px;
  }

  :global(.horizontal-list-wrap) {
    display: flex;
  }

  :global(.horizontal-list-item) {
    position: relative;
    border-radius: 5px;
    box-shadow: 0px 2px 10px -5px #57bbb4;
    padding: 16px;
    width: fit-content;
  }

  .item-title {
    display: flex;
    justify-content: space-between;
  }

  .index {
    float: left;
  }
</style>
