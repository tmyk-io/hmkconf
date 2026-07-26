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

import { uint8Schema, uint16Schema } from "$lib/integer"
import z from "zod"
import { HMK_MAX_NUM_COMBOS, HMK_MAX_NUM_LAYERS } from "."
import { Keycode } from "./keycodes"

export { HMK_MAX_NUM_COMBOS }
export const HMK_COMBO_MAX_KEYS = 4
export const DEFAULT_COMBO_TERM = 50
export const MIN_COMBO_TERM = 10
export const MAX_COMBO_TERM = 1000
export const COMBO_KEY_NONE = 0xff
export const COMBO_FLAG_MUST_HOLD = 1 << 0

export const hmkComboSchema = z.object({
  layer: uint8Schema.max(HMK_MAX_NUM_LAYERS - 1),
  keycode: uint8Schema,
  termMs: uint16Schema.min(MIN_COMBO_TERM).max(MAX_COMBO_TERM),
  keys: z.array(uint8Schema).length(HMK_COMBO_MAX_KEYS),
  flags: uint8Schema,
})

export type HMK_Combo = z.infer<typeof hmkComboSchema>

export const defaultCombo: HMK_Combo = {
  layer: 0,
  keycode: Keycode.KC_NO,
  termMs: DEFAULT_COMBO_TERM,
  keys: Array(HMK_COMBO_MAX_KEYS).fill(COMBO_KEY_NONE),
  flags: 0,
}

export function isComboEmpty(combo: HMK_Combo) {
  return combo.keys[0] === COMBO_KEY_NONE
}

export function packComboKeys(keys: number[]): number[] {
  const used = keys.filter((key) => key !== COMBO_KEY_NONE)
  return [
    ...used,
    ...Array(HMK_COMBO_MAX_KEYS - used.length).fill(COMBO_KEY_NONE),
  ]
}
