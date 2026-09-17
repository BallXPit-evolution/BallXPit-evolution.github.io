<script lang="ts">
	import { browser } from '$app/environment';
	import * as balls from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';

	const data = $state(JSON.stringify(ballData, null, 2));
	const allBalls = balls.createAllBalls(ballData);
	
	if(browser) {
		window.dev = balls;
		window.data = allBalls;
	}

	console.log("dev exposes functions, data exposes ball data")
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
	<title>Function Testing | BALL x PIT Evolution</title>
</svelte:head>

<p class="pb-16">Open the console</p>

<div class="max-h-[75%] overflow-y-auto border">
<pre>{data}</pre>
</div>