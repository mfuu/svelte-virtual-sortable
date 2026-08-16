<script>
  import VirtualList from '../../components/virtualList.svelte';

  let listRef = null;

  let index = $state(20);
  let align = $state('top');

  function scrollToIndex() {
    listRef.dispatchEvent('scrollToIndex', index, align);
  }
</script>

<button on:click={() => scrollToIndex()}>
  Scroll to <input type="text" bind:value={index} on:click={(e) => e.stopPropagation()} />
  Align
  <select bind:value={align} on:click={(e) => e.stopPropagation()}>
    <option value="auto">auto</option>
    <option value="top">top</option>
    <option value="bottom">bottom</option>
  </select>
</button>

<VirtualList bind:this={listRef} className="basic-virtual-list">
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
