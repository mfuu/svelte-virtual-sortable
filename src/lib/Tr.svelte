<script lang="ts">
  import { cssStringify } from './utils.js';

  let { offset, direction }: { offset: number; direction: 'horizontal' | 'vertical' } = $props();

  let style = $derived.by(() => {
    const offsetKey = direction === 'horizontal' ? 'width' : 'height';
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
