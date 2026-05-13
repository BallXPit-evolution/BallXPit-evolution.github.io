<script lang="ts">
	import { onMount } from 'svelte';
	import Header from './Header.svelte';
	import './layout.css';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if (browser) {
			console.log('version 1.0');
		}
	});
</script>

<div class="app flex h-screen flex-col">
	<Header />
	<main class="flex-1 overflow-x-hidden overflow-y-auto">
		{@render children()}
	</main>
</div>
