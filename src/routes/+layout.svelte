<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app flex h-screen flex-col">
	<Header />
	<main class="flex-1 overflow-y-auto overflow-x-hidden">
		{@render children()}
	</main>
</div>