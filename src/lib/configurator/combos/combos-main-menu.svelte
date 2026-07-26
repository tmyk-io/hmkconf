<!--
This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { CombineIcon } from "@lucide/svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Empty from "$lib/components/ui/empty"
  import { keyboardContext } from "$lib/keyboard"
  import { COMBO_KEY_NONE } from "$lib/libhmk/combos"
  import { combosStateContext } from "../context.svelte"
  import { combosQueryContext } from "../queries/combos-query.svelte"
  import CombosActiveBinding from "./combos-active-binding.svelte"

  const combosState = combosStateContext.get()
  const {
    metadata: { numCombos },
  } = keyboardContext.get()

  const { current: combos } = $derived(combosQueryContext.get().combos)

  const count = $derived(
    combos?.reduce(
      (acc, combo) => acc + (combo.keys[0] === COMBO_KEY_NONE ? 0 : 1),
      0,
    ),
  )
</script>

<div class="grid size-full grid-cols-[28rem_minmax(0,1fr)]">
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="font-semibold">Add Combo</div>
    <Button
      class="size-full gap-4 px-4 py-2"
      onclick={() => combosState.createOpen()}
      size="lg"
      variant="outline"
    >
      <CombineIcon class="size-6" />
      <div class="grid text-left text-sm text-wrap">
        <span class="font-medium">Combo</span>
        <span class="font-normal text-muted-foreground">
          Press 2–4 keys together within a term to emit one result keycode.
        </span>
      </div>
    </Button>
  </FixedScrollArea>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="font-semibold">
      Active Combos ({String(count ?? 0).padStart(2, "0")}/{String(
        numCombos,
      ).padStart(2, "0")})
    </div>
    {#if !combos || !count}
      <Empty.Root class="border border-dashed">
        <Empty.Header>
          <Empty.Description>No active combos...</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {:else}
      <div class="flex flex-col gap-2">
        {#each combos as combo, i (i)}
          {#if combo.keys[0] !== COMBO_KEY_NONE}
            <CombosActiveBinding index={i} {combo} />
          {/if}
        {/each}
      </div>
    {/if}
  </FixedScrollArea>
</div>
