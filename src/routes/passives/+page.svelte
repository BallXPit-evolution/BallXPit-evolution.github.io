<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createAllBalls,
		getEvolutionBalls,
		getEvolutionBallFromParents,
		type Ball,
		getAxisBalls
	} from '$lib/utils/balls';
	import ballData from '$lib/json/passives.json';
	import { loadCompletion } from '$lib/utils/completion';
	import GridRenderer from '$lib/components/GridRenderer.svelte';
	import { browser } from '$app/environment';
	import BallContext from '$lib/components/BallContext.svelte';

	// Initialize balls and resolve references
	const allBalls = createAllBalls(ballData);
	let collection: Array<Ball> = $state([]);
	let baseBalls = $derived(getAxisBalls(allBalls));
	let evolutionBalls = $derived(getEvolutionBalls(allBalls));

	// Filter for special evolutions (3+ ingredients)
	let specialEvolutions = $derived(
		evolutionBalls.filter((ball) => ball.parents?.some((recipe) => recipe.length >= 3))
	);

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

	onMount(() => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const gridPixelSize = gridSize * 100 + (gridSize - 1);
		const scaledGridSize = gridPixelSize * scale;

		pos = {
			x: (viewportWidth - scaledGridSize) / 2,
			y: (viewportHeight - scaledGridSize) / 2
		};

		if (browser) {
			collection = loadCompletion(allBalls);
		}
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
					description: `The combination of ${parent1} and ${parent2} is unknown.`,
					img: '',
					damageType: []
				};
			}
		}
		showTooltip = true;
	}

	function isBallInCollection(ball: Ball): boolean {
		const filtered = collection.filter((b) => b.name == ball.name);
		return filtered.length > 0;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showTooltip) {
			showTooltip = false;
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="relative z-1 flex-1 bg-[#050507]">
	<div
		class="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
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
			class="relative inline-block origin-top-left transition-transform duration-75 ease-out"
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
							<GridRenderer {cellBall} {row} {col} isCollected={isBallInCollection(cellBall)} />
						{:else if row == col}
							<div class="opacity-10 transition-opacity group-hover:opacity-40">
								<span class="font-mono text-[36px] text-white">X</span>
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

			<div
				class="pointer-events-auto absolute top-0 left-full ml-12 w-[350px] border border-indigo-900/40 bg-[#0b0b0e] p-6 shadow-2xl"
				style="max-height: {gridSize * 100}px; overflow-y: auto;"
			>
				<div class="mb-6">
					<h2 class="mb-1 text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase">
						Complex Fusion
					</h2>
					<p class="text-[10px] font-bold tracking-tighter text-gray-500 uppercase">
						Requires 3+ Ingredients
					</p>
				</div>

				<div class="flex flex-col gap-3">
					{#each specialEvolutions as ball (ball.name)}
						<button
							onclick={(e) => {
								e.stopPropagation();
								selectedBall = ball;
								showTooltip = true;
							}}
							class="group flex items-center gap-5 rounded-sm border border-indigo-900/20 bg-[#16161d]/80 p-4 text-left transition-all hover:border-indigo-500/60 hover:bg-[#1c1c24]"
						>
							<div
								class="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-black/60 p-2"
							>
								{#if ball.img}
									<img src={ball.img} alt={ball.name} class="h-full w-full object-contain" />
								{:else}
									<span class="text-[20px] text-indigo-500/20">?</span>
								{/if}
							</div>
							<div class="flex flex-col">
								<span class="text-lg font-bold text-indigo-50 group-hover:text-white">
									{ball.name}
								</span>
								<span class="text-[10px] font-black tracking-widest text-indigo-500/60 uppercase">
									{ball.parents.find((r) => r.length >= 3)?.length || 0} COMPONENTS
								</span>
							</div>
						</button>
					{/each}

					{#if specialEvolutions.length === 0}
						<div class="border border-dashed border-indigo-900/20 py-10 text-center">
							<span class="text-[10px] tracking-widest text-gray-600 uppercase">No Data</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if showTooltip && selectedBall}
		<BallContext {selectedBall} bind:showTooltip {allBalls} />
	{/if}
</div>
