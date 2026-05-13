<script lang="ts">
	import { onMount } from 'svelte';
	import { createAllBalls, type Ball } from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';
	import itemData from '$lib/json/passives.json';
	import {
		addCompletion,
		loadCompletion,
		removeCompletion,
		saveCompletion
	} from '$lib/utils/completion';

	// Initialize balls and resolve references
	const allBalls = createAllBalls([...ballData, ...itemData]);

	let collection: Array<Ball> = $state([]);
	let open = $state(false);
	let query = $state('');
	let selected = $state(null);

	let remainingBalls = $derived(
		allBalls.filter((b) => !collection.map((c) => c.name).includes(b.name))
	);

	let filteredBalls = $derived(
		remainingBalls.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
	);

	$inspect(collection);

	onMount(() => {
		collection = loadCompletion(allBalls);
	});

	function resetCompletion() {
		collection = [];
		saveCompletion(collection);
	}

	function doAdd(entry: Ball) {
		collection = addCompletion(entry, collection);
		saveCompletion(collection);
	}

	function doRemove(entry: Ball) {
		collection = removeCompletion(entry, collection);
		saveCompletion(collection);
	}
</script>

<div class="m-8 h-full w-full bg-[#050507]">
	<!-- counter -->
	<p class="pb-8">
		Your collection has {collection.length}
		{collection.length == 1 ? 'entry' : 'entries'} (Game has {allBalls.length} total entries)
	</p>

	<div class="relative w-64">
		<!-- dropdown btn -->
		<button
			class="flex w-full items-center justify-between rounded border bg-white px-3 py-2 text-black"
			onclick={() => (open = !open)}
		>
			<span>{selected ?? 'Select a Ball'}</span>
			<span>▾</span>
		</button>

		<!-- dropdown content -->
		{#if open}
			<div class="absolute z-10 w-full rounded border bg-white text-black shadow-lg">
				<!-- search -->
				<input
					class="w-full border-b px-3 py-2 outline-none"
					placeholder="Search Ball..."
					bind:value={query}
				/>

				<!-- list -->
				<ul class="max-h-40 overflow-y-auto">
					{#if filteredBalls.length === 0}
						<li class="px-3 py-2 text-gray-500">No results</li>
					{:else}
						{#each filteredBalls as ball (`select-${ball.name}`)}
							<li class="cursor-pointer px-3 py-2 hover:bg-gray-100" onclick={() => doAdd(ball)}>
								{ball.name}
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		{/if}
	</div>

	<div class="pt-8">
		<!-- overflow-y-auto not working here, just leaving as is -->
		{#each collection as ball (`collection-${ball.name}`)}
			<div class="flex items-center gap-3 py-2">
				<p class="min-w-64">{ball.name}</p>
				<button onclick={() => doRemove(ball)} class="rounded-md border bg-white p-2 text-red-600">
					Remove {ball.name}
				</button>
			</div>
		{/each}
	</div>

	{#if collection.length > 0}
		<button onclick={resetCompletion} class="mt-8 rounded-md border bg-red-300 p-2 text-red-900">
			RESET COLLECTION
		</button>
	{/if}
</div>
