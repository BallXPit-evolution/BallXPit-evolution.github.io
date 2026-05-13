<script lang="ts">
	import { tick } from 'svelte';
	import { createAllBalls, type Ball } from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';
	import BallContext from '$lib/components/BallContextTree.svelte';
	import TreeNode from './TreeNode.svelte';

	const allBalls = createAllBalls(ballData);
	let selectedBall = $state<Ball | null>(null);
	let showTooltip = $state(false); // Restore this

	let translate = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	function handleMouseDown(event: MouseEvent) {
		if ((event.target as HTMLElement).closest('button')) return;
		isDragging = true;
		dragStart = { x: event.clientX, y: event.clientY };
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		translate.x += event.clientX - dragStart.x;
		translate.y += event.clientY - dragStart.y;
		dragStart = { x: event.clientX, y: event.clientY };
	}

	function handleMouseUp() {
		isDragging = false;
	}

	async function selectBall(ball: Ball | null) {
		selectedBall = null;
		await tick();
		selectedBall = ball;
		if (ball) showTooltip = true; // Open tooltip on selection
	}

	// This is the key for "cycling" - it finds the full ball object and triggers the update
	function navigateTo(name: string) {
		const ball = allBalls.find((b) => b.name === name);
		if (ball) selectBall(ball);
	}
</script>

<div
	role="presentation"
	class="fixed inset-0 cursor-grab overflow-hidden bg-[#050507] select-none active:cursor-grabbing"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
>
	<div
		class="absolute will-change-transform"
		style="transform: translate({translate.x}px, {translate.y}px);"
	>
		<div class="p-[800px]">
			<TreeNode {allBalls} {selectedBall} onSelectBall={selectBall} />
		</div>
	</div>
</div>

{#if showTooltip && selectedBall}
	<BallContext
		{selectedBall}
		bind:showTooltip
		{allBalls}
		onSelectBall={(ball) => navigateTo(ball.name)}
	/>
{/if}
