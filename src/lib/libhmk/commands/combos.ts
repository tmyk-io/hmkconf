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

import { DataViewReader } from "$lib/data-view-reader"
import { uint16ToUInt8s } from "$lib/integer"
import type { GetCombosParams, SetCombosParams } from "$lib/keyboard"
import type { Commander } from "$lib/keyboard/commander"
import type { KeyboardMetadata } from "$lib/keyboard/metadata"
import { isFeatureAvailable } from "$lib/utils"
import { HMK_Command } from "."
import { HMK_COMBO_MAX_KEYS, type HMK_Combo } from "../combos"

const COMBO_SIZE = 9 // layer + keycode + term_ms(2) + keys[4] + flags

export async function getCombos(
  firmwareVersion: number,
  commander: Commander,
  keyboardMetadata: KeyboardMetadata,
  { profile }: GetCombosParams,
) {
  if (!isFeatureAvailable("combos", firmwareVersion)) return []

  const { numCombos } = keyboardMetadata
  const totalBytes = numCombos * COMBO_SIZE
  const buffer = new Uint8Array(totalBytes)

  for (let i = 0; i < totalBytes;) {
    const view = await commander.sendCommand({
      command: HMK_Command.GET_COMBOS,
      payload: [profile, i & 0xff, (i >> 8) & 0xff],
    })
    const numBytes = view.getUint8(0)
    buffer.set(new Uint8Array(view.buffer, 1, numBytes), i)
    i += numBytes
  }

  const ret: HMK_Combo[] = []
  for (let i = 0; i < numCombos; i++) {
    const reader = new DataViewReader(
      new DataView(buffer.buffer),
      i * COMBO_SIZE,
    )
    const layer = reader.uint8()
    const keycode = reader.uint8()
    const termMs = reader.uint16()
    const keys = [...Array(HMK_COMBO_MAX_KEYS)].map(() => reader.uint8())
    const flags = reader.uint8()
    ret.push({ layer, keycode, termMs, keys, flags })
  }

  return ret
}

const SET_COMBOS_BYTES_PER_PACKET = 59

export async function setCombos(
  firmwareVersion: number,
  commander: Commander,
  { profile, offset, data }: SetCombosParams,
) {
  if (!isFeatureAvailable("combos", firmwareVersion)) return

  const buffer: number[] = []

  for (const { layer, keycode, termMs, keys, flags } of data) {
    buffer.push(layer, keycode, ...uint16ToUInt8s(termMs), ...keys, flags)
  }

  for (let i = 0; i < buffer.length; i += SET_COMBOS_BYTES_PER_PACKET) {
    const part = buffer.slice(i, i + SET_COMBOS_BYTES_PER_PACKET)
    const partOffset = offset * COMBO_SIZE + i
    await commander.sendCommand({
      command: HMK_Command.SET_COMBOS,
      payload: [
        profile,
        partOffset & 0xff,
        (partOffset >> 8) & 0xff,
        part.length,
        ...part,
      ],
    })
  }
}
