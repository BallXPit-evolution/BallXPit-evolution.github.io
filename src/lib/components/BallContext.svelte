<script lang="ts">
	import type { Ball } from "$lib/utils/balls";

    let {
        selectedBall,
        showTooltip = $bindable(),
        allBalls,
    }:{
        selectedBall: Ball,
        showTooltip: boolean,
        allBalls: Array<Ball>
    } = $props();

	const DESC_LIMIT = 100;

    let descExpanded: boolean = $state(false);

	let childEvolutions = $derived(
		selectedBall
			? allBalls.filter((ball) =>
					ball.parents?.some((group) => group.some((parent) => parent.name === selectedBall?.name))
				)
			: []
	);

    $effect(() => {
        console.log(showTooltip);
        console.log(selectedBall);
        descExpanded = false;
    });

    function selectNewBall(ball: Ball) {
		selectedBall = ball;
		descExpanded = false;
	}

</script>


<aside
    class="tooltip-container fixed right-4 bottom-4 left-4 z-50 flex origin-bottom flex-col overflow-hidden rounded-xl border border-indigo-500 bg-[#0f0f12] text-slate-200 shadow-[0_0_80px_rgba(99,102,241,0.5)] backdrop-blur-2xl transition-transform duration-300 ease-out
    sm:right-12 sm:bottom-12 sm:left-auto sm:w-xl sm:scale-100"
>
    <div
        class="relative flex h-35 shrink-0 items-center justify-center border-b border-indigo-900/50 bg-linear-to-b from-indigo-950/50 to-transparent py-2 px-4"
    >
        {#if selectedBall.img}
            <div class="absolute top-1/2 left-5 -translate-y-1/2">
                <img
                    src={selectedBall.img}
                    alt={selectedBall.name}
                    class="h-28 w-28 rounded-full border-2 border-indigo-400 bg-[#241b1e] object-contain"
                />
            </div>
        {/if}
        <div class="ml-24 flex flex-col items-center">
            <h4
                class="text-center text-xl leading-none font-black tracking-widest text-indigo-400 uppercase
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
        class="cursor-pointer font-serif text-lg leading-relaxed text-slate-300 italic hover:bg-white/5 py-2 px-4"
        onclick={() => (descExpanded = !descExpanded)}
    >
        <div class="z-10">
            “{selectedBall.description}”
        </div>
    </div>

    {#if selectedBall.parents && selectedBall.parents.length > 0}
        <div class="border-t border-indigo-900/30 bg-indigo-950/20 py-2 px-4">
            <h5
                class="text-[9px] font-black tracking-[0.3em] text-indigo-500 uppercase sm:text-[10px]"
            >
                Fusion Recipes
            </h5>
            <div class="flex flex-col">
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
        <div class="border-t border-indigo-900/30 bg-indigo-950/10 py-2 px-4">
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

    {#if (selectedBall.statusEffect && selectedBall.statusEffect.length > 0) || selectedBall.damageType.length > 0}
        <div
            class="flex shrink-0 flex-wrap border-t border-indigo-900/50 bg-[#050507]/80 py-2 px-4"
        >
            <div class="mb-1 flex w-full items-center gap-2">
                <span class="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase"
                    >Element Profile</span
                >
            </div>

            {#each selectedBall.damageType as type, index (index)}
                <span
                    class="rounded border border-indigo-500/20 bg-indigo-950/40 px-4 py-2 text-xs font-black tracking-[0.2em] text-indigo-300 uppercase mr-2"
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
    {/if}
</aside>