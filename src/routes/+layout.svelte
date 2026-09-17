<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Header from './Header.svelte';
	import './layout.css';
	import { browser } from '$app/environment';

	let { children } = $props();

	function trackPageView() {
		if (browser) {
			(window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('config', 'G-7ZKYH305ZF', {
				page_path: page.url.pathname + page.url.search
			});
		}
	}

	onMount(() => {
		if (browser) {
			console.log('version 1.0');
			trackPageView();
		}
	});

	$effect(() => {
		trackPageView();
	});
</script>

<div class="app flex h-screen flex-col">
	<Header />
	<main
		class="flex-1 overflow-x-hidden {page.url.pathname === '/' || page.url.pathname === '/passives'
			? 'overflow-y-hidden'
			: 'overflow-y-auto'} "
	>
		{@render children()}
	</main>
</div>
