<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Href } from 'expo-router';

	const routes = [
		{
			name: 'Ball Evolutions',
			link: '/' as Href
		},
		{
			name: 'Passive Evolutions',
			link: '/passives' as Href
		},
		{
			name: 'Collection',
			link: '/collection' as Href
		},
		{
			name: 'Tree',
			link: '/tree' as Href
		}
	];

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<header class="z-[100] flex w-full justify-center border-b border-indigo-950 bg-black">
	<nav class="relative flex w-full items-center justify-center" style="--background: #0a0a0c;">
		<!-- Desktop nav -->
		<div class="hidden justify-center md:flex">
			<svg viewBox="0 0 2 3" aria-hidden="true" class="block h-12 w-8">
				<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" fill="#0a0a0c" />
			</svg>
			<ul class="m-0 flex h-12 list-none items-center bg-[#0a0a0c] px-4">
				{#each routes as route (route.link)}
					<li
						class="group relative flex h-full items-center"
						aria-current={page.url.pathname === route.link ? 'page' : undefined}
					>
						{#if page.url.pathname === route.link}
							<span
								class="absolute top-0 right-[10%] left-[10%] h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]"
							></span>
						{/if}

						<a
							href={resolve(route.link)}
							class="px-6 text-[0.7rem] font-extrabold tracking-[0.15em] text-slate-400 uppercase no-underline transition-all duration-200 hover:text-indigo-400 hover:[text-shadow:0_0_10px_rgba(99,102,241,0.5)]"
						>
							{route.name}
						</a>
					</li>
				{/each}
			</ul>
			<svg viewBox="0 0 2 3" aria-hidden="true" class="block h-12 w-8">
				<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" fill="#0a0a0c" />
			</svg>
		</div>

		<!-- Mobile burger button -->
		<div class="flex h-12 w-full items-center justify-between bg-[#0a0a0c] px-4 md:hidden">
			<span class="text-[0.7rem] font-extrabold tracking-[0.15em] text-slate-400 uppercase">
				BALL x PIT Evolutions
			</span>
			<button
				onclick={toggleMenu}
				aria-label="Toggle menu"
				aria-expanded={menuOpen}
				class="p-1 text-slate-400 transition-colors duration-200 hover:text-indigo-400"
			>
				{#if menuOpen}
					<!-- X icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Burger icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile dropdown menu -->
		{#if menuOpen}
			<ul
				class="absolute top-full left-0 z-50 m-0 flex w-full list-none flex-col border-t border-indigo-950 bg-[#0a0a0c] p-0 md:hidden"
			>
				{#each routes as route (route.link)}
					<li class="relative" aria-current={page.url.pathname === route.link ? 'page' : undefined}>
						{#if page.url.pathname === route.link}
							<span
								class="absolute top-0 bottom-0 left-0 w-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]"
							></span>
						{/if}

						<a
							href={resolve(route.link)}
							onclick={closeMenu}
							class="block px-6 py-4 text-[0.7rem] font-extrabold tracking-[0.15em] text-slate-400 uppercase no-underline transition-all duration-200 hover:bg-indigo-950/20 hover:text-indigo-400"
						>
							{route.name}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>
</header>
