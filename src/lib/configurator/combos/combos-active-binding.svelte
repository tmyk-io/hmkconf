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
  import { SquarePenIcon, TrashIcon } from "@lucide/svelte"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import { Button } from "$lib/components/ui/button"
  import type { HMK_Combo } from "$lib/libhmk/combos"
  import { unitToStyle } from "$lib/ui"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { Snippet } from "svelte"
  import type { HTMLAttributes } from "svelte/elements"
  import { combosStateContext } from "../context.svelte"
  import { getComboKeys } from "../lib/combos"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import CombosDeleteDialog from "./combos-delete-dialog.svelte"

  const {
    class: className,
    index,
    combo,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> & {
    index: number
    combo: HMK_Combo
  } = $props()

  const combosState = combosStateContext.get()
  const { current: keymap } = $derived(keymapQueryContext.get().keymap)
  const { layer, keycode, termMs } = $derived(combo)
  const keys = $derived(getComboKeys(combo))
</script>

<div
  class={cn(
    "flex w-full divide-x rounded-md border bg-card shadow-xs select-none",
    className,
  )}
  {...props}
>
  <div class="grid shrink-0 grid-cols-2 p-2 text-xs">
    {#each keys as key, i (i)}
      <div class="p-0.5" style={unitToStyle()}>
        {#if !keymap}
          <KeycodeButton.Skeleton />
        {:else}
          <KeycodeButton.Root keycode={keymap[layer][key]}>
            {#snippet child({ props: { children, ...props } })}
              <div {...props}>{@render (children as Snippet)?.()}</div>
            {/snippet}
          </KeycodeButton.Root>
        {/if}
      </div>
    {/each}
  </div>
  <div class="flex flex-1 items-center gap-2 overflow-x-auto p-2">
    <div class="p-0.5" style={unitToStyle()}>
      <KeycodeButton.Root {keycode}>
        {#snippet child({ props: { children, ...props } })}
          <div {...props}>{@render (children as Snippet)?.()}</div>
        {/snippet}
      </KeycodeButton.Root>
    </div>
    <span class="text-sm text-muted-foreground">{termMs}ms</span>
  </div>
  <div class="flex shrink-0 items-center gap-2 p-2">
    <Button
      onclick={() => {
        combosState.setLayer(layer)
        combosState.setIndex(index)
      }}
      size="icon"
      variant="outline"
    >
      <SquarePenIcon />
      <span class="sr-only">Edit</span>
    </Button>
    <CombosDeleteDialog {index} {combo}>
      {#snippet child({ props })}
        <Button size="icon" variant="outline" {...props}>
          <TrashIcon />
          <span class="sr-only">Delete</span>
        </Button>
      {/snippet}
    </CombosDeleteDialog>
  </div>
</div>
