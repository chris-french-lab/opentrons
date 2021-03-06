// @flow
import assert from 'assert'
import * as React from 'react'
import {connect} from 'react-redux'
import {AlertItem} from '@opentrons/components'
import {actions as dismissActions, selectors as dismissSelectors} from '../../dismiss'
import {getVisibleAlerts} from './utils'
import {selectors as stepsSelectors} from '../../ui/steps'
import {selectors as stepFormSelectors} from '../../step-forms'
import type {Dispatch} from 'redux'
import type {StepIdType} from '../../form-types'
import type {StepFieldName} from '../../steplist/fieldLevel'
import type {FormError, FormWarning} from '../../steplist/formLevel'
import type {BaseState} from '../../types'

/* TODO:  BC 2018-09-13 move to src/components/alerts and adapt and use src/components/alerts/Alerts
* see #1814 for reference
*/

type SP = {
  errors: Array<FormError>,
  warnings: Array<FormWarning>,
  stepId: ?(StepIdType | string),
}
type DP = {
  dismissWarning: (FormWarning, $PropertyType<SP, 'stepId'>) => mixed,
}
type OP = {
  focusedField: ?StepFieldName,
  dirtyFields: Array<StepFieldName>,
}
type FormAlertsProps = SP & DP

class FormAlerts extends React.Component<FormAlertsProps> {
  makeHandleCloseWarning = (warning: FormWarning) => () => {
    this.props.dismissWarning(warning, this.props.stepId)
  }

  render () {
    return (
      <React.Fragment>
        {this.props.errors.map((error, index) => (
          <AlertItem
            type="warning"
            key={index}
            title={error.title}
          >
            {error.body}
          </AlertItem>
        ))}
        {this.props.warnings.map((warning, index) => (
          <AlertItem
            type="warning"
            key={index}
            title={warning.title}
            onCloseClick={this.makeHandleCloseWarning(warning)}
          >
            {warning.body}
          </AlertItem>
        ))}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: BaseState, ownProps: OP): SP => {
  const {focusedField, dirtyFields} = ownProps
  const visibleWarnings = getVisibleAlerts({
    focusedField,
    dirtyFields,
    alerts: dismissSelectors.getFormWarningsForSelectedStep(state),
  })

  const unsavedFormErrors = stepFormSelectors.getUnsavedFormErrors(state)
  const formLevelErrors = (unsavedFormErrors && unsavedFormErrors.form) || []
  const filteredErrors = getVisibleAlerts({
    focusedField,
    dirtyFields,
    alerts: formLevelErrors,
  })

  return {
    errors: filteredErrors,
    warnings: visibleWarnings,
    stepId: stepsSelectors.getSelectedStepId(state),
  }
}

const mapDispatchToProps = (dispatch: Dispatch<*>): DP => ({
  dismissWarning: (warning, stepId) => {
    if (stepId == null) {
      assert(false, 'Tried to dismiss form-level warning with no stepId.')
      return
    }
    dispatch(dismissActions.dismissFormWarning({warning, stepId}))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(FormAlerts)
