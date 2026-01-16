<script>
  import VirtualList from '../../components/virtualList.svelte';
</script>

<VirtualList tableMode className="table-virtual-list">
  {#snippet header()}
    <thead style="position: sticky; top: 0;">
      <tr>
        <th style="width: 15%">index</th>
        <th style="width: 25%">name</th>
        <th style="width: 60%">content</th>
      </tr>
    </thead>
  {/snippet}
  {#snippet item({ item, index, key })}
    <td>
      <span class="index">#{item.index}</span>
      <span class="handle">☰</span>
    </td>
    <td>{item.name}</td>
    <td>{item.desc}</td>
  {/snippet}
</VirtualList>

<style scoped>
  :global(.table-virtual-list) {
    height: 60vh;
    padding: 5px;
    font-size: 14px;
  }

  .index {
    float: left;
  }
</style>
