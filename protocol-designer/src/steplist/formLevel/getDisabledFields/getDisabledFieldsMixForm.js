// @flow
import type {FormData} from '../../../form-types'

// NOTE: expects that '_checkbox' fields are implemented so that
// when checkbox is disabled, its dependent fields are hidden
export default function getDisabledFieldsMixForm (
  rawForm: FormData // TODO IMMEDIATELY use raw form type instead of FormData
): Set<string> {
  const disabled = new Set()

  if (!rawForm.pipette || !rawForm['labware']) {
    disabled.add('mix_touchTip_checkbox')
    disabled.add('mix_mmFromBottom')
    disabled.add('wells')
  }

  return disabled
}
