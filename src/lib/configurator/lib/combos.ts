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

import { HMK_AKType, type HMK_AdvancedKey } from "$lib/libhmk/advanced-keys"
import {
  COMBO_KEY_NONE,
  HMK_COMBO_MAX_KEYS,
  packComboKeys,
  type HMK_Combo,
} from "$lib/libhmk/combos"
import { Keycode } from "$lib/libhmk/keycodes"

export function getComboKeys(combo: HMK_Combo) {
  return combo.keys.filter((key) => key !== COMBO_KEY_NONE)
}

export function keysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  return sortedA.every((key, i) => key === sortedB[i])
}

export function hasAdvancedKeyOnLayer(
  advancedKeys: HMK_AdvancedKey[],
  layer: number,
  key: number,
) {
  return advancedKeys.some((ak) => {
    if (ak.action.type === HMK_AKType.NONE || ak.layer !== layer) return false
    if (ak.key === key) return true
    return (
      ak.action.type === HMK_AKType.NULL_BIND && ak.action.secondaryKey === key
    )
  })
}

export type ComboValidationIssue =
  | "too-few-keys"
  | "duplicate-keys"
  | "advanced-key"
  | "invalid-keycode"
  | "duplicate-combo"

export function validateCombo(options: {
  combo: HMK_Combo
  advancedKeys: HMK_AdvancedKey[]
  combos: HMK_Combo[]
  index?: number
}): ComboValidationIssue | null {
  const { combo, advancedKeys, combos, index } = options
  const keys = getComboKeys(combo)

  if (keys.length < 2) return "too-few-keys"
  if (new Set(keys).size !== keys.length) return "duplicate-keys"
  if (
    keys.some((key) => hasAdvancedKeyOnLayer(advancedKeys, combo.layer, key))
  ) {
    return "advanced-key"
  }
  if (
    combo.keycode === Keycode.KC_NO ||
    combo.keycode === Keycode.KC_TRANSPARENT
  ) {
    return "invalid-keycode"
  }

  const duplicate = combos.some((other, i) => {
    if (i === index) return false
    if (other.keys[0] === COMBO_KEY_NONE) return false
    if (other.layer !== combo.layer) return false
    return keysEqual(getComboKeys(other), keys)
  })
  if (duplicate) return "duplicate-combo"

  return null
}

export function buildCombo(options: {
  layer: number
  keys: number[]
  keycode: number
  termMs: number
}): HMK_Combo {
  return {
    layer: options.layer,
    keycode: options.keycode,
    termMs: options.termMs,
    keys: packComboKeys(options.keys.slice(0, HMK_COMBO_MAX_KEYS)),
    flags: 0,
  }
}
