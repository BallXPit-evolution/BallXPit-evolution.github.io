<script lang="ts">
	import type { Ball } from "$lib/utils/balls";

	let {
		cellBall,
		row,
		col,
		isCollected = false,
	}: {
		cellBall: Ball,
		row: number,
		col: number,
		isCollected: boolean,
	} = $props();
</script>

<div class="relative h-full w-full p-2 {row === 0 || col === 0 ? 'bg-indigo-950/20' : ''}">
	{#if isCollected}
		<span class="z-10 absolute top-1 right-1 h-5 w-5 rounded-full bg-green-500 shadow-md"></span>
	{/if}

	<img
		src={cellBall.img}
		alt={cellBall.name}
		class="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] filter"
	/>
</div>