/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { keyboardContext, type SetCombosParams } from "$lib/keyboard"
import type { HMK_Combo } from "$lib/libhmk/combos"
import { Context, resource, type ResourceReturn } from "runed"
import { optimisticUpdate } from "."
import { globalStateContext } from "../context.svelte"

export class CombosQuery {
  combos: ResourceReturn<HMK_Combo[]>

  #keyboard = keyboardContext.get()
  #profile = $derived(globalStateContext.get().profile)

  constructor() {
    this.combos = resource(
      () => ({ profile: this.#profile }),
      (p) => this.#keyboard.getCombos(p),
    )
  }

  async set(params: Omit<SetCombosParams, "profile">) {
    const { offset, data } = params
    await optimisticUpdate({
      resource: this.combos,
      optimisticFn: (current) => {
        const ret = [...current]
        for (let i = 0; i < data.length; i++) {
          ret[offset + i] = data[i]
        }
        return ret
      },
      updateFn: () =>
        this.#keyboard.setCombos({ ...params, profile: this.#profile }),
    })
  }
}

export const combosQueryContext = new Context<CombosQuery>("hmk-combos-query")
