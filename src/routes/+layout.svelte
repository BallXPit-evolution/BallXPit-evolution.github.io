<script lang="ts">
	import { onMount } from 'svelte';
	import Header from './Header.svelte';
	import './layout.css';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if(browser){
			console.log("pre-passives build")
		}
	})
</script>

<div class="app flex h-screen flex-col">
	<Header />
	<main class="flex-1 overflow-y-auto overflow-x-hidden">
		{@render children()}
	</main>
</div>