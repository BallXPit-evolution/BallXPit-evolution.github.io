<script lang="ts">
	import { tick } from 'svelte';
	import { createAllBalls, type Ball } from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';
	import BallContext from '$lib/components/BallContextTree.svelte';
	import TreeNode from './TreeNode.svelte';

	const allBalls = createAllBalls(ballData);
	let selectedBall = $state<Ball | null>(null);
	let showTooltip = $state(false); // Restore this

	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	let initialTouchDist = 0;
	let initialTouchScale = 1;

	const MIN_ZOOM = 0.5; // Adjust as needed
	const MAX_ZOOM = 2.0; // Adjust as needed

	let scale = $state(1);
	let pos = $state({ x: 0, y: 0 });
	let hasMoved = $state(false);

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			isDragging = true;
			hasMoved = false;
			dragStart = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
		} else if (e.touches.length === 2) {
			isDragging = false;
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
			const touch = e.touches[0];
			const dx = Math.abs(touch.clientX - (dragStart.x + pos.x));
			const dy = Math.abs(touch.clientY - (dragStart.y + pos.y));
			if (dx > 5 || dy > 5) hasMoved = true;

			pos.x = touch.clientX - dragStart.x;
			pos.y = touch.clientY - dragStart.y;
		} else if (e.touches.length === 2) {
			e.preventDefault();
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
			if (initialTouchDist > 0) {
				const factor = dist / initialTouchDist;
				const newScale = Math.min(Math.max(0.1, initialTouchScale * factor), 4);
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

		// const newScale = Math.min(Math.max(0.1, scale + delta), 4);
		// New scalings
		const newScale = Math.min(Math.max(MIN_ZOOM, scale + delta), MAX_ZOOM);

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
	onwheel={handleWheel}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<div
		class="absolute will-change-transform"
		style="transform: translate3d({pos.x}px, {pos.y}px, 0) scale({scale}); transform-origin: 0 0;"
	>
		<div class="flex min-h-screen items-center justify-center">
			<TreeNode {allBalls} {selectedBall} {scale} onSelectBall={selectBall} />
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
