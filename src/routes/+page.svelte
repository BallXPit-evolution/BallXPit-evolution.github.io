<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createAllBalls,
		getEvolutionBalls,
		getEvolutionBallFromParents,
		type Ball,
		getAxisBalls
	} from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';
	import { assets } from '$app/paths';

	// Initialize balls and resolve references
	const allBalls = createAllBalls(ballData);
	let baseBalls = $derived(getAxisBalls(allBalls));
	let evolutionBalls = $derived(getEvolutionBalls(allBalls));

	const gridSize = $derived(baseBalls.length + 1);
	const totalCells = $derived(gridSize * gridSize);

	let scale = $state(0.3);
	let pos = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let hasMoved = $state(false);
	let dragStart = { x: 0, y: 0 };

	let initialTouchDist = 0;
	let initialTouchScale = 1;

	let showTooltip = $state(false);
	let selectedBall = $state<Ball | null>(null);
	let descExpanded = $state(false);
	const DESC_LIMIT = 200;

	// Find balls where current selection is a parent
	let childEvolutions = $derived(
		selectedBall
			? allBalls.filter((ball) =>
					ball.parents?.some((group) => group.some((parent) => parent.name === selectedBall?.name))
				)
			: []
	);

	onMount(() => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const gridPixelSize = gridSize * 100 + (gridSize - 1);
		const scaledGridSize = gridPixelSize * scale;

		pos = {
			x: (viewportWidth - scaledGridSize) / 2,
			y: (viewportHeight - scaledGridSize) / 2
		};
	});

	function getBallAtCoord(row: number, col: number): Ball | null {
		if (row === 0 && col === 0) return null;
		if (row === 0 || col === 0) {
			return baseBalls[(row || col) - 1];
		}
		const p1 = baseBalls[row - 1].name;
		const p2 = baseBalls[col - 1].name;
		return getEvolutionBallFromParents([p1, p2], evolutionBalls) || null;
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			// Single finger: Start dragging
			const touch = e.touches[0];
			isDragging = true;
			hasMoved = false;
			dragStart = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
		} else if (e.touches.length === 2) {
			// Two fingers: Start pinch zoom
			isDragging = false; // Prevent dragging while zooming
			const dist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			initialTouchDist = dist;
			initialTouchScale = scale;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 1 && isDragging) {
			// Single finger: Dragging logic
			const touch = e.touches[0];
			const dx = Math.abs(touch.clientX - (dragStart.x + pos.x));
			const dy = Math.abs(touch.clientY - (dragStart.y + pos.y));
			if (dx > 5 || dy > 5) hasMoved = true;

			pos.x = touch.clientX - dragStart.x;
			pos.y = touch.clientY - dragStart.y;
		} else if (e.touches.length === 2) {
			// Two fingers: Pinch zoom logic
			e.preventDefault(); // Prevent page scrolling
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

			if (initialTouchDist > 0) {
				const factor = dist / initialTouchDist;
				const newScale = Math.min(Math.max(0.1, initialTouchScale * factor), 4);

				// Calculate midpoint for zoom anchor
				const midX = (touch1.clientX + touch2.clientX) / 2;
				const midY = (touch1.clientY + touch2.clientY) / 2;

				const target = e.currentTarget as HTMLElement;
				const rect = target.getBoundingClientRect();
				const mouseX = midX - rect.left;
				const mouseY = midY - rect.top;

				const gridX = (mouseX - pos.x) / scale;
				const gridY = (mouseY - pos.y) / scale;

				scale = newScale;
				pos.x = mouseX - gridX * scale;
				pos.y = mouseY - gridY * scale;
			}
		}
	}

	function handleTouchEnd() {
		isDragging = false;
		initialTouchDist = 0;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		if (!target) return;
		const zoomSpeed = 0.001;
		const delta = -e.deltaY * zoomSpeed;
		const newScale = Math.min(Math.max(0.1, scale + delta), 4);
		const rect = target.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const gridX = (mouseX - pos.x) / scale;
		const gridY = (mouseY - pos.y) / scale;
		scale = newScale;
		pos.x = mouseX - gridX * scale;
		pos.y = mouseY - gridY * scale;
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		isDragging = true;
		hasMoved = false;
		dragStart = { x: e.clientX - pos.x, y: e.clientY - pos.y };
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const dx = Math.abs(e.clientX - (dragStart.x + pos.x));
		const dy = Math.abs(e.clientY - (dragStart.y + pos.y));
		if (dx > 5 || dy > 5) hasMoved = true;

		pos.x = e.clientX - dragStart.x;
		pos.y = e.clientY - dragStart.y;
	}

	function onMouseUp() {
		isDragging = false;
	}

	function handleCellClick(row: number, col: number) {
		if (hasMoved) return;
		if (row === 0 && col === 0) return;

		descExpanded = false;
		if (row === 0 || col === 0) {
			const index = (row || col) - 1;
			selectedBall = baseBalls[index];
		} else {
			const parent1 = baseBalls[row - 1].name;
			const parent2 = baseBalls[col - 1].name;
			const fusion = getEvolutionBallFromParents([parent1, parent2], evolutionBalls);
			if (fusion) {
				selectedBall = fusion;
			} else {
				selectedBall = {
					name: '404 Evolution',
					description: `The combination of ${parent1} and ${parent2} is unknown, it might not exist. Maybe this is what destroyed Babylon...?`,
					img: '',
					damageType: ['Null'],
					statusEffect: ['None']
				};
			}
		}
		showTooltip = true;
	}

	function selectNewBall(ball: Ball) {
		selectedBall = ball;
		descExpanded = false;
	}
</script>

<div
	class="h-full w-full cursor-grab touch-none overflow-hidden bg-[#050507] select-none active:cursor-grabbing"
	onwheel={handleWheel}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="presentation"
>
	<div
		class="inline-block origin-top-left transition-transform duration-75 ease-out"
		style="transform: translate({pos.x}px, {pos.y}px) scale({scale});"
	>
		<div
			class="grid border border-indigo-900/30 bg-[#1a1a1e]"
			style="grid-template-columns: repeat({gridSize}, 100px); gap: 1px;"
		>
			{#each Array(totalCells) as _, i (i)}
				{@const row = Math.floor(i / gridSize)}
				{@const col = i % gridSize}
				{@const cellBall = getBallAtCoord(row, col)}

				<button
					type="button"
					onclick={() => handleCellClick(row, col)}
					class="group relative flex aspect-square items-center justify-center bg-[#0f0f12] transition-all duration-200 hover:bg-[#16161d]"
				>
					{#if row === 0 && col === 0}
						<span class="text-[10px] font-bold tracking-widest text-indigo-500/20">AXIS</span>
					{:else if cellBall && cellBall.img}
						<div class="h-full w-full p-2 {row === 0 || col === 0 ? 'bg-indigo-950/20' : ''}">
							<img
								src={cellBall.img}
								alt={cellBall.name}
								class="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] filter"
							/>
						</div>
					{:else if row > 0 && col > 0}
						<div class="opacity-10 transition-opacity group-hover:opacity-40">
							<span class="font-mono text-[36px] text-indigo-300 opacity-10">?</span>
						</div>
					{/if}
					<div
						class="pointer-events-none absolute inset-0 border border-indigo-500/50 opacity-0 group-hover:opacity-100"
					></div>
				</button>
			{/each}
		</div>
	</div>
</div>

{#if showTooltip && selectedBall}
	<aside
		class="tooltip-container fixed right-4 bottom-4 left-4 z-50 flex min-h-[520px] origin-bottom flex-col overflow-hidden rounded-xl border border-indigo-500 bg-[#0f0f12] text-slate-200 shadow-[0_0_80px_rgba(99,102,241,0.5)] backdrop-blur-2xl transition-transform duration-300 ease-out
		sm:right-12 sm:bottom-12 sm:left-auto sm:w-[36rem] sm:scale-100"
	>
		<div
			class="relative flex h-[180px] flex-shrink-0 items-center justify-center border-b border-indigo-900/50 bg-gradient-to-b from-indigo-950/50 to-transparent p-10"
		>
			{#if selectedBall.img}
				<div class="absolute top-1/2 left-10 -translate-y-1/2">
					<img
						src={selectedBall.img}
						alt={selectedBall.name}
						class="h-28 w-28 rounded-full border-2 border-indigo-400 bg-[#050507] object-contain p-2"
					/>
				</div>
			{/if}
			<div class="ml-28 flex flex-col items-center">
				<h4
					class="text-center text-xl leading-none font-black tracking-[0.1em] text-indigo-400 uppercase
						sm:text-3xl sm:tracking-[0.35em]"
				>
					{selectedBall.name}
				</h4>
				<div class="mt-4 h-1 w-24 rounded-full bg-indigo-500/30"></div>
			</div>
			<button
				onclick={() => (showTooltip = false)}
				class="absolute top-6 right-6 border border-indigo-900 px-2 py-1 text-xs font-black tracking-widest text-indigo-900 hover:text-indigo-400"
				>ESC</button
			>
		</div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="min-h-[140px] flex-grow cursor-pointer p-10 font-serif text-lg leading-relaxed text-slate-300 italic hover:bg-white/5"
			onclick={() => (descExpanded = !descExpanded)}
		>
			<div class="relative z-10 px-4">
				{#if descExpanded || selectedBall.description.length <= DESC_LIMIT}
					“{selectedBall.description}”
				{:else}
					“{selectedBall.description.slice(0, DESC_LIMIT)}...”
					<span
						class="mt-4 block text-[10px] font-bold tracking-[0.2em] text-indigo-500 uppercase not-italic"
						>Expand Logs</span
					>
				{/if}
			</div>
		</div>

		{#if selectedBall.parents && selectedBall.parents.length > 0}
			<div class="border-t border-indigo-900/30 bg-indigo-950/20 px-4 py-4 sm:px-10 sm:py-6">
				<h5
					class="mb-3 text-[9px] font-black tracking-[0.3em] text-indigo-500 uppercase sm:mb-4 sm:text-[10px]"
				>
					Fusion Recipes
				</h5>
				<div class="flex flex-col gap-3 sm:gap-6">
					{#each selectedBall.parents as recipe, recipeIndex (recipeIndex)}
						<div class="flex items-center gap-2 sm:gap-3">
							{#each recipe as parentBall, i (i)}
								<button
									onclick={() => selectNewBall(parentBall)}
									class="group flex items-center gap-2 rounded border border-indigo-500/20 bg-[#1a1a1e] px-2 py-1.5 transition-all hover:border-indigo-500 sm:px-4 sm:py-2"
								>
									{#if parentBall.img}
										<img
											src={parentBall.img}
											alt={parentBall.name}
											class="h-4 w-4 object-contain sm:h-5 sm:w-5"
										/>
									{/if}
									<span class="text-[10px] font-bold text-indigo-200 uppercase sm:text-xs">
										{parentBall.name}
									</span>
								</button>

								{#if i < recipe.length - 1}
									<span class="text-lg font-light text-indigo-500/50 sm:text-xl">+</span>
								{/if}
							{/each}
						</div>

						{#if recipeIndex < selectedBall.parents.length - 1}
							<div class="flex items-center">
								<div class="h-px flex-1 bg-indigo-500/10"></div>
								<span class="px-2 text-[8px] font-black text-indigo-900 uppercase">OR</span>
								<div class="h-px flex-1 bg-indigo-500/10"></div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if childEvolutions.length > 0}
			<div class="border-t border-indigo-900/30 bg-indigo-950/10 px-4 py-4 sm:px-10 sm:py-6">
				<h5 class="mb-3 text-[9px] font-black tracking-[0.3em] text-indigo-400 uppercase">
					Used In Evolutions
				</h5>
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					{#each childEvolutions as child, index (index)}
						<button
							onclick={() => selectNewBall(child)}
							class="group flex items-center gap-2 rounded border border-indigo-500/10 bg-[#1a1a1e] px-3 py-1 transition-all hover:border-indigo-500/50 sm:px-4 sm:py-2"
						>
							{#if child.img}
								<img
									src={child.img}
									alt={child.name}
									class="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 sm:h-5 sm:w-5"
								/>
							{/if}
							<span
								class="text-[10px] font-bold text-indigo-300/70 uppercase group-hover:text-indigo-200 sm:text-xs"
							>
								{child.name}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div
			class="flex flex-shrink-0 flex-wrap gap-4 border-t border-indigo-900/50 bg-[#050507]/80 p-8"
		>
			<div class="mb-1 flex w-full items-center gap-2">
				<span class="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase"
					>Element Profile</span
				>
				<div class="h-px flex-1 bg-indigo-900/30"></div>
			</div>

			{#each selectedBall.damageType as type, index (index)}
				<span
					class="rounded border border-indigo-500/20 bg-indigo-950/40 px-4 py-2 text-xs font-black tracking-[0.2em] text-indigo-300 uppercase"
				>
					{type}
				</span>
			{/each}

			{#if selectedBall.statusEffect && selectedBall.statusEffect.length > 0}
				{#each selectedBall.statusEffect as effect, index (index)}
					<span
						class="rounded border border-emerald-500/20 bg-emerald-950/40 px-4 py-2 text-xs font-black tracking-[0.2em] text-emerald-300 uppercase"
					>
						{effect}
					</span>
				{/each}
			{/if}
		</div>
	</aside>
{/if}
