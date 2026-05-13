<script lang="ts">
	import { getBaseBalls, type Ball } from '$lib/utils/balls';
	import { onMount, tick } from 'svelte';

	let { allBalls, selectedBall, onSelectBall } = $props<{
		allBalls: Ball[];
		selectedBall: Ball | null;
		onSelectBall: (ball: Ball | null) => void;
	}>();

	const layout = {
		tierGap: 'gap-y-35',
		baseGap: 'gap-5',
		evoGap: 'gap-6',
		nodeSize: 'h-16 w-16'
	};

	let container: HTMLElement;
	let coords = $state(new Map<string, { x: number; y: number }>());

	// Helper to find full ball objects for navigation
	function navigateTo(name: string) {
		const ball = allBalls.find((b) => b.name === name);
		if (ball) onSelectBall(ball);
	}

	// Find children for the selected node
	const selectedChildren = $derived.by(() => {
		if (!selectedBall) return [];
		return allBalls.filter((b) =>
			b.parents?.some((group) => group.some((p) => p.name === selectedBall?.name))
		);
	});

	async function selectBall(ball: Ball | null) {
		selectedBall = null;
		await tick();
		selectedBall = ball;
	}

	function getBallDepth(ball: Ball, all: Ball[], cache = new Map<string, number>()): number {
		if (cache.has(ball.name)) return cache.get(ball.name)!;
		if (!ball.parents || ball.parents.length === 0) {
			cache.set(ball.name, 0);
			return 0;
		}
		let maxParentDepth = 0;
		for (const group of ball.parents) {
			for (const parent of group) {
				const parentObj = all.find((b) => b.name === parent.name);
				if (parentObj) {
					maxParentDepth = Math.max(maxParentDepth, getBallDepth(parentObj, all, cache));
				}
			}
		}
		const depth = 1 + maxParentDepth;
		cache.set(ball.name, depth);
		return depth;
	}

	// 1. Create a helper for the base ball colors to avoid inline TS logic
	const baseBallColors = $derived.by(() => {
		const baseTier = tiers[0] || [];
		const map = new Map<string, string>();
		baseTier.forEach((ball, i) => {
			const hue = i * (360 / Math.max(baseTier.length, 1));
			map.set(ball.name, `hsla(${hue}, 80%, 65%, 0.5)`);
		});
		return map;
	});

	function getParentColor(parentName: string) {
		return baseBallColors.get(parentName) || '#334155';
	}

	function getAncestors(ball: Ball, seen: Set<string>) {
		if (!ball.parents) return;
		ball.parents.forEach((group) => {
			group.forEach((parent) => {
				if (!seen.has(parent.name)) {
					seen.add(parent.name);
					const pObj = allBalls.find((b) => b.name === parent.name);
					if (pObj) getAncestors(pObj, seen);
				}
			});
		});
	}

	function getDescendants(target: Ball, list: Ball[], seen: Set<string>) {
		list.forEach((ball) => {
			const isChild = ball.parents?.some((group) => group.some((p) => p.name === target.name));
			if (isChild && !seen.has(ball.name)) {
				seen.add(ball.name);
				getDescendants(ball, list, seen);
			}
		});
	}

	const tiers = $derived.by(() => {
		const depthMap = new Map<string, number>();
		const result: Ball[][] = [];
		allBalls.forEach((ball) => {
			const d = getBallDepth(ball, allBalls, depthMap);
			if (!result[d]) result[d] = [];
			result[d].push(ball);
		});
		return result;
	});

	const activeBallNames = $derived.by(() => {
		const baseNames = getBaseBalls(allBalls).map((b) => b.name);
		const names = new Set<string>(baseNames);
		if (selectedBall) {
			names.add(selectedBall.name);
			getAncestors(selectedBall, names);
			getDescendants(selectedBall, allBalls, names);
		}
		return names;
	});

	async function updateCoords() {
		await tick();
		if (!container) return;
		const parentRect = container.getBoundingClientRect();
		const newCoords = new Map();
		container.querySelectorAll('[data-ball-name]').forEach((el) => {
			const rect = el.getBoundingClientRect();
			newCoords.set(el.getAttribute('data-ball-name')!, {
				x: rect.left - parentRect.left + rect.width / 2,
				y: rect.top - parentRect.top + rect.height / 2
			});
		});
		coords = newCoords;
	}

	$effect(() => {
		activeBallNames;
		selectedBall;
		updateCoords();
	});

	onMount(() => {
		const ro = new ResizeObserver(updateCoords);
		ro.observe(container);
		return () => ro.disconnect();
	});
</script>

<div bind:this={container} class="relative min-w-max p-10 select-none">
	<svg class="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
		{#each allBalls as ball}
			{#if activeBallNames.has(ball.name) && ball.parents && coords.has(ball.name)}
				{@const end = coords.get(ball.name)!}
				{#each ball.parents as group}
					{#each group as parent}
						{#if activeBallNames.has(parent.name) && coords.has(parent.name)}
							{@const start = coords.get(parent.name)!}
							<path
								d="M {start.x} {start.y} C {start.x} {(start.y + end.y) / 2}, {end.x} {(start.y +
									end.y) /
									2}, {end.x} {end.y}"
								stroke={getParentColor(parent.name)}
								stroke-width="2"
								fill="none"
								class="opacity-40 transition-all duration-500"
							/>
						{/if}
					{/each}
				{/each}
			{/if}
		{/each}
	</svg>

	<div class="relative z-10 flex flex-col items-center {layout.tierGap}">
		{#each tiers as tier, index}
			<div class="flex flex-wrap justify-center {index === 0 ? layout.baseGap : layout.evoGap}">
				{#each tier as ball}
					{#if activeBallNames.has(ball.name)}
						<div data-ball-name={ball.name} class="animate-in fade-in zoom-in duration-500">
							{@render node(ball, baseBallColors.get(ball.name) || '#1e293b')}
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

{#snippet node(ball, color)}
	{@const isSelected = selectedBall?.name === ball.name}
	<div class="group relative flex items-center justify-center">
		<button
			onclick={() => onSelectBall(ball)}
			class="relative flex {layout.nodeSize} items-center justify-center rounded-full border-2 bg-[#0b0b10] transition-all
				{isSelected
				? 'z-20 scale-125 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
				: 'hover:scale-110 active:scale-95'}"
			style="border-color: {isSelected ? '#ffffff' : color}"
		>
			{#if ball.img}
				<img src={ball.img} alt={ball.name} class="h-full w-full rounded-full object-cover p-1.5" />
			{:else}
				<span class="text-[9px] font-bold text-slate-500"
					>{ball.name.slice(0, 3).toUpperCase()}</span
				>
			{/if}

			<div
				class="pointer-events-none absolute -bottom-8 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] whitespace-nowrap text-slate-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
			>
				{ball.name}
			</div>
		</button>
	</div>
{/snippet}
