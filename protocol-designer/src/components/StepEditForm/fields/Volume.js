// @flow
import * as React from 'react'
import cx from 'classnames'
import {FormGroup, HoverTooltip} from '@opentrons/components'
import type {StepType} from '../../../form-types'
import type {FocusHandlers} from '../types'
import styles from '../StepEditForm.css'
import {getTooltipForField} from '../utils'
import TextField from './Text'

type Props = {stepType: StepType, focusHandlers: FocusHandlers, label: string}
const Volume = (props: Props) => (
  <HoverTooltip
    tooltipComponent={getTooltipForField(props.stepType, 'volume')}
    placement='top-start'>
    {(hoverTooltipHandlers) =>
      <FormGroup
        label={props.label}
        className={cx(styles.volume_field, styles.small_field)}
        hoverTooltipHandlers={hoverTooltipHandlers}>
        <TextField name="volume" units="μL" {...props.focusHandlers} />
      </FormGroup>
    }
  </HoverTooltip>
)

export default Volume
