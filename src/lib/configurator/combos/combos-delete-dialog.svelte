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
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { defaultCombo, type HMK_Combo } from "$lib/libhmk/combos"
  import type { ComponentProps } from "svelte"
  import { combosStateContext } from "../context.svelte"
  import { combosQueryContext } from "../queries/combos-query.svelte"

  const {
    children,
    index,
    ...props
  }: ComponentProps<typeof Dialog.Trigger> & {
    index: number
    combo: HMK_Combo
  } = $props()

  const combosState = combosStateContext.get()
  const { index: currentIndex } = $derived(combosState)
  const combosQuery = combosQueryContext.get()
</script>

<Dialog.Root>
  <Dialog.Trigger {...props}>{@render children?.()}</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Remove this Combo?</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to remove this combo?
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        {#snippet child({ props })}
          <Button size="sm" variant="outline" {...props}>Cancel</Button>
        {/snippet}
      </Dialog.Close>
      <Dialog.Close
        onclick={() => {
          if (index === currentIndex) {
            combosState.setIndex(null)
          }
          combosQuery.set({
            offset: index,
            data: [defaultCombo],
          })
        }}
      >
        {#snippet child({ props })}
          <Button size="sm" variant="destructive" {...props}>Remove</Button>
        {/snippet}
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
