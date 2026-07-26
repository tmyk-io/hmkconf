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
  import CommitSlider from "$lib/components/commit-slider.svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import { Button } from "$lib/components/ui/button"
  import {
    MAX_COMBO_TERM,
    MIN_COMBO_TERM,
    type HMK_Combo,
  } from "$lib/libhmk/combos"
  import { unitToStyle } from "$lib/ui"
  import { combosStateContext } from "../context.svelte"
  import { getComboKeys, validateCombo } from "../lib/combos"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { combosQueryContext } from "../queries/combos-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import CombosDeleteDialog from "./combos-delete-dialog.svelte"

  const combosState = combosStateContext.get()
  const { index } = $derived(combosState)

  const combosQuery = combosQueryContext.get()
  const { current: combos } = $derived(combosQuery.combos)
  const { current: advancedKeys } = $derived(
    advancedKeysQueryContext.get().advancedKeys,
  )
  const { current: keymap } = $derived(keymapQueryContext.get().keymap)

  const combo = $derived(combos?.[index!] as HMK_Combo | undefined)
  const keys = $derived(combo ? getComboKeys(combo) : [])
  const issue = $derived(
    !combo || !combos || !advancedKeys
      ? null
      : validateCombo({
          combo,
          advancedKeys,
          combos,
          index: index!,
        }),
  )
  const issueMessage = $derived.by(() => {
    switch (issue) {
      case "too-few-keys":
        return "Select at least 2 keys on the keyboard."
      case "duplicate-keys":
        return "Combo keys must be distinct."
      case "advanced-key":
        return "A selected key already has an Advanced Key on this layer."
      case "invalid-keycode":
        return "Select a result keycode (not None or Transparent)."
      case "duplicate-combo":
        return "Another combo already uses this key set on this layer."
      default:
        return null
    }
  })

  function update(partial: Partial<HMK_Combo>) {
    if (index === null || !combo) return
    combosQuery.set({ offset: index, data: [{ ...combo, ...partial }] })
  }
</script>

{#if !combos || !combo || !keymap || !advancedKeys}
  <div class="grid size-full place-items-center p-6 text-center">
    <p class="animate-pulse text-2xl font-semibold text-muted-foreground">
      Loading...
    </p>
  </div>
{:else}
  <div class="grid size-full grid-cols-[minmax(0,1fr)_24rem]">
    <div class="flex size-full flex-col">
      <div class="flex items-center justify-between gap-4 p-4">
        <div class="font-semibold">Edit Combo</div>
        <div class="flex items-center gap-2">
          <CombosDeleteDialog index={index!} {combo}>
            {#snippet child({ props })}
              <Button size="sm" variant="destructive" {...props}>Delete</Button>
            {/snippet}
          </CombosDeleteDialog>
          <Button
            disabled={issue !== null}
            onclick={() => combosState.setIndex(null)}
            size="sm"
          >
            Done
          </Button>
        </div>
      </div>
      <FixedScrollArea class="flex flex-col gap-4 p-4">
        <div class="grid text-sm">
          <span class="font-medium">Layer {combo.layer}</span>
          <span class="text-muted-foreground">
            Toggle trigger keys on the keyboard (2–4). Pick a result keycode
            below.
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-muted-foreground">Keys</span>
          {#each keys as key, i (i)}
            <div class="p-0.5" style={unitToStyle()}>
              <KeycodeButton.Root keycode={keymap[combo.layer][key]} />
            </div>
          {/each}
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground">Result</span>
          <div class="p-0.5" style={unitToStyle()}>
            <KeycodeButton.Root keycode={combo.keycode} />
          </div>
        </div>
        <CommitSlider
          bind:committed={() => combo.termMs, (v) => update({ termMs: v })}
          description="Time window to complete the chord after the first key press."
          display={(v) => `${v}ms`}
          min={MIN_COMBO_TERM}
          max={MAX_COMBO_TERM}
          step={10}
          title="Combo term (ms)"
        />
        {#if issueMessage}
          <p class="text-sm text-destructive">{issueMessage}</p>
        {/if}
      </FixedScrollArea>
    </div>
    <FixedScrollArea class="p-4">
      <KeycodeAccordion onKeycodeSelected={(keycode) => update({ keycode })} />
    </FixedScrollArea>
  </div>
{/if}
