# Start

## Installation

```sh [npm]
npm i svelte-virtual-sortable
```

## Simple Usage

```ts
<script>
  import VirtualList from 'svelte-virtual-sortable';

  let items = [{id: '1', text: 'a'}, {id: '2', text: 'b'}, ...];

  function onDrop(event) {
    console.log('onDrop', event);
    items = event.list;
  }
</script>

<VirtualList
  dataSource={items}
  dataKey="id"
  handle=".handle"
  style={{ height: '500px' }}
  onDrop={onDrop}
>
  {#snippet item({ item, index, key })}
    <span class="handle">☰</span>
    <p>{item.desc}</p>
  {/snippet}
</VirtualList>
```
