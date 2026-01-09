<script lang="ts">
  import { page } from '$app/state';
  import type { Page } from '@sveltejs/kit';
  import '../app.css';

  const pages = [{ name: 'Basic list', component: 'basic_list' }];

  let current_path = '';

  function get_path(page: Page) {
    const route_parts = page.route.id.split('/');
    return route_parts[route_parts.length - 1];
  }

  $: current_path = get_path(page);
</script>

<svelte:head>
  <title>example</title>
</svelte:head>

<main>
  <h1>example</h1>
  <div class="page-selector-container">
    {#each pages as page}
      <a href={page.component} class="page-selector" class:active={current_path === page.component}
        >{page.name}</a
      >
    {/each}
    <a
      class="source"
      href="https://github.com/mfuu/svelte-virtual-sortable/tree/main/src/routes/{current_path}"
      >Source</a
    >
  </div>
  <slot></slot>
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
    max-width: 900px;
  }

  .page-selector-container {
    margin-bottom: 20px;
  }

  .page-selector {
    margin-right: 10px;
    cursor: pointer;
    color: blue;
  }

  .page-selector:hover {
    text-decoration: underline;
  }

  .page-selector.active {
    font-weight: bold;
  }

  .source {
    float: right;
    color: blue;
  }
</style>
