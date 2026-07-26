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
  import { KeyboardEditorKeyboard } from "$lib/components/keyboard-editor"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import {
    COMBO_KEY_NONE,
    defaultCombo,
    packComboKeys,
    type HMK_Combo,
  } from "$lib/libhmk/combos"
  import { Toggle } from "bits-ui"
  import { combosStateContext } from "../context.svelte"
  import { getComboKeys, hasAdvancedKeyOnLayer } from "../lib/combos"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { combosQueryContext } from "../queries/combos-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"

  const combosState = combosStateContext.get()
  const { layer, index, create } = $derived(combosState)

  const combosQuery = combosQueryContext.get()
  const { current: combos } = $derived(combosQuery.combos)
  const { current: advancedKeys } = $derived(
    advancedKeysQueryContext.get().advancedKeys,
  )
  const { current: keymap } = $derived(keymapQueryContext.get().keymap)

  const { disabled, indexMatrix, selectedKeys } = $derived.by(() => {
    if (!combos || !keymap || !advancedKeys) {
      return { disabled: true } as const
    }

    const indexMatrix: (number | null)[] = Array(keymap[0].length).fill(null)
    for (let i = 0; i < combos.length; i++) {
      const combo = combos[i]
      if (combo.keys[0] === COMBO_KEY_NONE || combo.layer !== layer) continue
      for (const key of getComboKeys(combo)) {
        indexMatrix[key] = i
      }
    }

    let selectedKeys: number[] = []
    if (create !== null) {
      selectedKeys = create.keys
    } else if (index !== null) {
      selectedKeys = getComboKeys(combos[index])
    }

    return { disabled: false, indexMatrix, selectedKeys } as const
  })

  function isKeyDisabled(key: number) {
    if (disabled || !advancedKeys) return true
    if (create !== null) {
      if (hasAdvancedKeyOnLayer(advancedKeys, layer, key)) return true
      if (selectedKeys.includes(key)) return false
      return selectedKeys.length >= 4
    }
    if (index !== null) {
      if (hasAdvancedKeyOnLayer(advancedKeys, layer, key)) return true
      if (selectedKeys.includes(key)) return false
      return selectedKeys.length >= 4
    }
    return indexMatrix[key] === null
  }

  function updateEditKeys(key: number, pressed: boolean) {
    if (index === null || !combos) return
    const combo = combos[index]
    let keys = getComboKeys(combo)
    if (pressed) {
      if (!keys.includes(key) && keys.length < 4) keys = [...keys, key]
    } else {
      keys = keys.filter((k) => k !== key)
    }
    if (keys.length < 2) return
    const next: HMK_Combo = {
      ...combo,
      keys: packComboKeys(keys),
    }
    combosQuery.set({ offset: index, data: [next] })
  }
</script>

<KeyboardEditorKeyboard>
  {#snippet keyGenerator(key)}
    {#if disabled}
      <KeycodeButton.Skeleton />
    {:else}
      <Toggle.Root
        bind:pressed={
          () => selectedKeys.includes(key),
          (v) => {
            if (create !== null) {
              combosState.createToggleKey(key)
            } else if (index !== null) {
              updateEditKeys(key, v)
            } else {
              combosState.setIndex(v ? indexMatrix[key] : null)
            }
          }
        }
        disabled={isKeyDisabled(key)}
        oncontextmenu={(e) => {
          if (create !== null || index !== null || indexMatrix[key] === null) {
            return
          }
          e.preventDefault()
          if (indexMatrix[key] === index) {
            combosState.setIndex(null)
          }
          combosQuery.set({
            offset: indexMatrix[key],
            data: [defaultCombo],
          })
        }}
      >
        {#snippet child({ props })}
          <KeycodeButton.Root keycode={keymap![layer][key]} {...props} />
        {/snippet}
      </Toggle.Root>
    {/if}
  {/snippet}
</KeyboardEditorKeyboard>
