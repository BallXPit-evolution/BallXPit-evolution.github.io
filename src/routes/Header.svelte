<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Href } from 'expo-router';

	const routes = [
		{
			name: "Ball Evolutions",
			link: "/" as Href,
		},
		{
			name: "Passive Evolutions",
			link: "/passives" as Href,
		},
		{
			name: "Collection",
			link: "/collection" as Href,
		},
	]

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

</script>

<header class="flex justify-center w-full z-[100] bg-black border-b border-indigo-950">
	<nav class="flex justify-center items-center w-full relative" style="--background: #0a0a0c;">

		<!-- Desktop nav -->
		<div class="hidden md:flex justify-center">
			<svg viewBox="0 0 2 3" aria-hidden="true" class="w-8 h-12 block">
				<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" fill="#0a0a0c" />
			</svg>
			<ul class="bg-[#0a0a0c] list-none flex h-12 items-center m-0 px-4">
				{#each routes as route (route.link)}
					<li
						class="relative flex items-center h-full group"
						aria-current={page.url.pathname === route.link ? 'page' : undefined}
					>
						{#if page.url.pathname === route.link}
							<span class="absolute top-0 left-[10%] right-[10%] h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
						{/if}
						
						<a href={resolve(route.link)}
							class="text-slate-400 font-extrabold text-[0.7rem] uppercase tracking-[0.15em] px-6 no-underline transition-all duration-200 hover:text-indigo-400 hover:[text-shadow:0_0_10px_rgba(99,102,241,0.5)]"
						>
							{route.name}
						</a>
					</li>
				{/each}
			</ul>
			<svg viewBox="0 0 2 3" aria-hidden="true" class="w-8 h-12 block">
				<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" fill="#0a0a0c" />
			</svg>
		</div>

		<!-- Mobile burger button -->
		<div class="flex md:hidden w-full items-center justify-between px-4 h-12 bg-[#0a0a0c]">
			<span class="text-slate-400 font-extrabold text-[0.7rem] uppercase tracking-[0.15em]">
				BALL x PIT Evolutions
			</span>
			<button
				onclick={toggleMenu}
				aria-label="Toggle menu"
				aria-expanded={menuOpen}
				class="text-slate-400 hover:text-indigo-400 transition-colors duration-200 p-1"
			>
				{#if menuOpen}
					<!-- X icon -->
					<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Burger icon -->
					<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile dropdown menu -->
		{#if menuOpen}
			<ul class="md:hidden absolute top-full left-0 w-full bg-[#0a0a0c] border-t border-indigo-950 list-none m-0 p-0 flex flex-col z-50">
				{#each routes as route (route.link)}
					<li
						class="relative"
						aria-current={page.url.pathname === route.link ? 'page' : undefined}
					>
						{#if page.url.pathname === route.link}
							<span class="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
						{/if}
						
						<a href={resolve(route.link)}
							onclick={closeMenu}
							class="block text-slate-400 font-extrabold text-[0.7rem] uppercase tracking-[0.15em] px-6 py-4 no-underline transition-all duration-200 hover:text-indigo-400 hover:bg-indigo-950/20"
						>
							{route.name}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>
</header>