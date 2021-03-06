// @flow
import * as React from 'react'
import {FormGroup, CheckboxField, DropdownField, type Options} from '@opentrons/components'
import {connect} from 'react-redux'
import cx from 'classnames'

import {getMaxDisposalVolumeForMultidispense} from '../../../steplist/formLevel/handleFormChange/utils'
import {selectors as stepFormSelectors} from '../../../step-forms'
import {selectors as uiLabwareSelectors} from '../../../ui/labware'
import {getBlowoutLocationOptionsForForm} from '../utils'

import FieldConnector from './FieldConnector'
import TextField from './Text'

import type {BaseState} from '../../../types'
import type {FocusHandlers} from '../types'
import styles from '../StepEditForm.css'

type SP = {
  disposalDestinationOptions: Options,
  maxDisposalVolume: ?number,
}

type Props = SP & {focusHandlers: FocusHandlers}

const DisposalVolumeField = (props: Props) => (
  <FormGroup label='Multi-Dispense Options:'>
    <FieldConnector
      name="disposalVolume_checkbox"
      render={({value, updateValue, hoverTooltipHandlers}) => {
        const {maxDisposalVolume} = props
        const volumeBoundsCaption = maxDisposalVolume != null
          ? `max ${maxDisposalVolume} μL`
          : null

        const volumeField = (
          <div>
            <TextField
              name="disposalVolume_volume"
              units="μL"
              caption={volumeBoundsCaption}
              className={cx(styles.small_field, styles.orphan_field)}
              {...props.focusHandlers} />
          </div>
        )

        return (
          <React.Fragment>
            <div {...hoverTooltipHandlers} className={cx(
              styles.checkbox_row,
              styles.multi_dispense_options,
              {[styles.captioned_field]: volumeBoundsCaption}
            )}>
              <CheckboxField
                label="Disposal Volume"
                value={Boolean(value)}
                className={styles.checkbox_field}
                onChange={(e: SyntheticInputEvent<*>) => updateValue(!value)} />
              {
                value
                  ? volumeField
                  : null
              }
            </div>
            {
              value
                ? (
                  <FieldConnector
                    name="blowout_location"
                    focusedField={props.focusHandlers.focusedField}
                    dirtyFields={props.focusHandlers.dirtyFields}
                    render={({value, updateValue, hoverTooltipHandlers}) => (
                      <div {...hoverTooltipHandlers} className={styles.checkbox_row} >
                        <div className={styles.sub_select_label}>Blowout</div>
                        <DropdownField
                          className={cx(styles.medium_field, styles.orphan_field)}
                          options={props.disposalDestinationOptions}
                          onBlur={() => { props.focusHandlers.onFieldBlur('blowout_location') }}
                          onFocus={() => { props.focusHandlers.onFieldFocus('blowout_location') }}
                          value={value ? String(value) : null}
                          onChange={(e: SyntheticEvent<HTMLSelectElement>) => { updateValue(e.currentTarget.value) } } />
                      </div>
                    )} />
                )
                : null
            }
          </React.Fragment>
        )
      }} />
  </FormGroup>
)

const mapSTP = (state: BaseState): SP => {
  const rawForm = stepFormSelectors.getUnsavedForm(state)
  return {
    maxDisposalVolume: getMaxDisposalVolumeForMultidispense(rawForm, stepFormSelectors.getPipetteEntities(state)),
    disposalDestinationOptions: getBlowoutLocationOptionsForForm(
      uiLabwareSelectors.getDisposalLabwareOptions(state),
      rawForm
    ),
  }
}

export default connect(mapSTP)(DisposalVolumeField)
