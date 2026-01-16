<script lang="ts">
  import { Marked } from 'marked';
  import { markedHighlight } from 'marked-highlight';
  import hljs from 'highlight.js';
  import { onMount } from 'svelte';

  const { filePath = '' } = $props();

  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  async function fetchMarkdownFile(filePath: string) {
    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const markdown = await response.text();

      return markdown;
    } catch (error) {
      console.error('Error fetching the Markdown file:', error);
      return '';
    }
  }

  let markdown: string | Promise<string> = $state('');
  onMount(async () => {
    const fileContent = await fetchMarkdownFile(filePath);
    markdown = marked.parse(fileContent);
  });
</script>

{@html markdown}
