<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { onDestroy, onMount, untrack } from 'svelte';
  import { resolve } from '$app/paths';
  import { browser } from '$app/environment';

  let { children } = $props();

  let activeTab = $state('');
  let activeMenu = $state('');
  let asideMenus = $state([]);
  let asideVisible = $state(false);
  let menuItems = $state({
    guide: [
      { label: 'Start', value: 'start', page: resolve('/guide/start') },
      { label: 'Props', value: 'props', page: resolve('/guide/props') },
      { label: 'Methods', value: 'methods', page: resolve('/guide/methods') },
      { label: 'Callback', value: 'callback', page: resolve('/guide/callback') },
    ],
    demo: [
      { label: 'Basic', value: 'basic', page: resolve('/demo/basic') },
      { label: 'Group', value: 'group', page: resolve('/demo/group') },
      { label: 'Horizontal', value: 'horizontal', page: resolve('/demo/horizontal') },
      { label: 'Table', value: 'table', page: resolve('/demo/table') },
    ],
  });

  $effect(() => {
    page.route.id;

    untrack(() => onPageChange());
  });

  function onPageChange() {
    const routeId = page.route.id;
    activeTab = routeId.split('/')[1];
    activeMenu = routeId.split('/')[2];
    asideMenus = menuItems[activeTab];
  }

  function returnToTop() {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeAsideVisible(event: MouseEvent) {
    event.stopPropagation();
    asideVisible = true;
  }

  function changeAsideVisibleHidden(event: MouseEvent) {
    event.stopPropagation();
    asideVisible = false;
  }

  function addClickEventListener() {
    document.addEventListener('click', (e) => changeAsideVisibleHidden(e));
  }

  function removeClickEventListener() {
    document.removeEventListener('click', (e) => changeAsideVisibleHidden(e));
  }

  onMount(() => {
    browser && addClickEventListener();
  });

  onDestroy(() => {
    browser && removeClickEventListener();
  });
</script>

<header class="header flex a-i-c j-c-s">
  <div class="title flex a-i-c">
    <div class="fill flex a-i-c">
      <span>svelte-virtual-sortable</span>
    </div>
  </div>
  <div class="right flex a-i-c">
    <div class="tabs">
      {#each Object.keys(menuItems) as tab}
        <a class="tab" class:active={tab === activeTab} href={menuItems[tab][0].page}>
          {tab}
        </a>
      {/each}
    </div>
    <div class="divider"></div>
    <a
      class="icon social-github cursor-pointer"
      href="https://github.com/mfuu/svelte-virtual-sortable"
      target="_blank"
      title="View source code on GitHub"
    ></a>
  </div>
</header>

{#if asideVisible}
  <div class="backdrop"></div>
{/if}

<aside class="aside" class:visible={asideVisible} onclick={changeAsideVisibleHidden}>
  <ul class="group">
    {#each asideMenus as menu}
      <li
        class="menu-item"
        class:active={menu.value === activeMenu}
        onclick={changeAsideVisibleHidden}
      >
        <a href={menu.page}>{menu.label}</a>
      </li>
    {/each}
  </ul>
</aside>

<section class="local-nav flex a-i-c j-c-s">
  <div class="left">
    <div class="cursor-pointer flex a-i-c" onclick={changeAsideVisible}>
      <span class="icon"></span>
      <span class="label">Menu</span>
    </div>
  </div>
  <div class="right">
    <span class="label cursor-pointer" onclick={returnToTop}>Return to top</span>
  </div>
</section>

<main class="main">
  <div class="content">
    {@render children()}
  </div>
</main>

<style>
  .header {
    position: relative;
    top: 0;
    z-index: 30;
    height: 64px;
    width: 100%;

    .title {
      padding: 0 32px;
      width: 272px;
      height: 100%;
      font-size: 16px;
      font-weight: 600;
      background-color: transparent;
      border-bottom: 1px solid #e2e2e3;
    }

    .fill {
      height: 100%;
      border-bottom: 1px solid transparent;
    }

    .right {
      flex: 1;
      justify-content: flex-end;
      height: 100%;
      padding-right: 32px;
      border-bottom: 1px solid #e2e2e3;
      background: #ffffff;

      .icon {
        width: 20px;
        height: 20px;
        color: rgba(60, 60, 67, 0.78);

        &:hover {
          color: rgba(60, 60, 67);
        }
      }
    }

    .tab {
      padding: 0 12px;
      cursor: pointer;

      &.active,
      &:hover {
        color: #3451b2;
      }

      &.active {
        font-weight: 600;
      }
    }

    .divider {
      margin-left: 16px;
      margin-right: 24px;
      width: 1px;
      height: 24px;
      background-color: #e2e2e3;
    }
  }

  .backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.6);
    transition: opacity 0.5s;
  }

  .aside {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 25;
    padding: 32px 32px 96px;
    width: 272px;
    background-color: #f6f6f7;
    opacity: 0;
    overflow-x: hidden;
    overflow-y: auto;
    transform: translate(-100%);
    transition:
      opacity 0.5s,
      transform 0.25s ease;
    overscroll-behavior: contain;

    &.visible {
      z-index: 60;
      opacity: 1;
      transform: translate(0);
    }

    .group {
      padding-top: 10px;
    }

    .menu-item {
      padding: 4px 0;
      line-height: 24px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.25s;
      cursor: pointer;

      &.active {
        color: #3451b2;
        font-weight: 700;
      }
    }
  }

  .local-nav {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 48px;
    padding: 0 32px;
    border-bottom: 1px solid #e2e2e3;
    background: #ffffff;

    .icon {
      display: inline-block;
      font-size: 14px;
      margin-right: 8px;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M21 6H3M15 12H3M17 18H3'/%3E%3C/svg%3E")
        no-repeat;
    }

    .label {
      font-size: 12px;

      &:hover {
        color: rgba(60, 60, 67);
      }
    }
  }

  .content {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px 96px;
  }

  @media (min-width: 960px) {
    .header {
      position: fixed;
    }

    .header .title {
      border-bottom-color: transparent;
    }

    .header .fill {
      border-bottom-color: #e2e2e3;
    }

    .aside {
      padding-top: 64px;
      max-width: 100%;
      background-color: #f6f6f7;
      opacity: 1;
      visibility: visible;
      box-shadow: none;
      transform: translate(0);
    }

    .main {
      padding-top: 64px;
      padding-left: 272px;
    }

    .local-nav {
      display: none;
    }

    .content {
      padding: 48px 32px 0;
    }
  }

  @media (min-width: 768px) {
    .content {
      padding: 48px 32px 128px;
    }
  }
</style>
