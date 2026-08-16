<script lang="ts">
  import { cssStringify } from './utils.js';

  let { offset, isHorizontal }: { offset: number; isHorizontal: boolean } = $props();

  let style = $derived.by(() => {
    const offsetKey = isHorizontal ? 'width' : 'height';
    return {
      padding: '0',
      border: '0',
      [offsetKey]: `${offset}px`,
    };
  });
</script>

<tr>
  <td style={cssStringify(style)}></td>
</tr>
