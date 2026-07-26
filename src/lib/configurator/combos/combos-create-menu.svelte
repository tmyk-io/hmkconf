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
  import { KeyButton } from "$lib/components/key-button"
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import { Button } from "$lib/components/ui/button"
  import {
    COMBO_KEY_NONE,
    DEFAULT_COMBO_TERM,
    MAX_COMBO_TERM,
    MIN_COMBO_TERM,
  } from "$lib/libhmk/combos"
  import { Keycode } from "$lib/libhmk/keycodes"
  import { unitToStyle } from "$lib/ui"
  import { combosStateContext } from "../context.svelte"
  import { buildCombo, validateCombo } from "../lib/combos"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { combosQueryContext } from "../queries/combos-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"

  const combosState = combosStateContext.get()
  const { layer, create } = $derived(combosState)
  const { keys } = $derived(create!)

  let keycode = $state(Keycode.KC_NO)
  let termMs = $state(DEFAULT_COMBO_TERM)

  const combosQuery = combosQueryContext.get()
  const { current: combos } = $derived(combosQuery.combos)
  const { current: advancedKeys } = $derived(
    advancedKeysQueryContext.get().advancedKeys,
  )
  const { current: keymap } = $derived(keymapQueryContext.get().keymap)

  const draft = $derived(buildCombo({ layer, keys, keycode, termMs }))
  const issue = $derived(
    !combos || !advancedKeys
      ? "too-few-keys"
      : validateCombo({ combo: draft, advancedKeys, combos }),
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
</script>

<div class="grid size-full grid-cols-[minmax(0,1fr)_24rem]">
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="flex items-center justify-between gap-4">
      <div class="font-semibold">New Combo</div>
      <div class="flex items-center gap-2">
        <Button
          onclick={() => combosState.createClose()}
          size="sm"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={issue !== null || !combos}
          onclick={() => {
            if (!combos || issue !== null) return
            const index = combos.findIndex(
              (combo) => combo.keys[0] === COMBO_KEY_NONE,
            )
            if (index === -1) return
            combosQuery.set({ offset: index, data: [draft] })
            combosState.setIndex(index)
          }}
          size="sm"
        >
          Save
        </Button>
      </div>
    </div>
    <div class="grid text-sm">
      <span class="font-medium"
        >Select 2–4 trigger keys, then a result keycode.</span
      >
      <span class="text-muted-foreground">
        Keys with an Advanced Key on this layer cannot be used.
      </span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-muted-foreground">Keys</span>
      {#each { length: 4 }, i (i)}
        <div class="p-0.5" style={unitToStyle()}>
          {#if !keymap || keys[i] === undefined}
            <KeyButton class="border-dashed font-normal text-muted-foreground">
              <span>{i < 2 ? "Required" : "Optional"}</span>
            </KeyButton>
          {:else}
            <KeycodeButton.Root keycode={keymap[layer][keys[i]]} />
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex items-center gap-4">
      <span class="text-sm text-muted-foreground">Result</span>
      <div class="p-0.5" style={unitToStyle()}>
        {#if keycode === Keycode.KC_NO}
          <KeyButton class="border-dashed font-normal text-muted-foreground">
            <span>Assign</span>
          </KeyButton>
        {:else}
          <KeycodeButton.Root {keycode} />
        {/if}
      </div>
    </div>
    <CommitSlider
      bind:committed={termMs}
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
  <FixedScrollArea class="p-4">
    <KeycodeAccordion
      onKeycodeSelected={(kc) => {
        keycode = kc
      }}
    />
  </FixedScrollArea>
</div>
