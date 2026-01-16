<script lang="ts">
  import Marked from '../../components/marked.svelte';
  import { asset } from '$app/paths';
</script>

<div>
  <Marked filePath={asset('/guide/start.md')} />
</div>
