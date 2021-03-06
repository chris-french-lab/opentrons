// @flow
import {createSelector} from 'reselect'
// TODO: Ian 2018-07-02 split apart file-data concerns to avoid circular dependencies
// Eg, right now if you import {selectors as fileDataSelectors} from '../file-data',
// PD won't start, b/c of circular dependency when fileData/selectors/fileCreator
// imports getDismissedWarnings selector from 'dismiss/
import {timelineWarningsPerStep} from '../file-data/selectors/commands'
import {selectors as stepFormSelectors} from '../step-forms'
import {selectors as stepsSelectors} from '../ui/steps'
import type {FormWarning} from '../steplist'
import type {CommandCreatorWarning} from '../step-generation'
import type {BaseState, Selector} from '../types'
import type {RootState, DismissedWarningsAllSteps} from './reducers'

export const rootSelector = (state: BaseState): RootState => state.dismiss

export const getAllDismissedWarnings: Selector<*> = createSelector(
  rootSelector,
  s => s.dismissedWarnings
)

export const getDismissedFormWarnings: Selector<DismissedWarningsAllSteps<FormWarning>> = createSelector(
  getAllDismissedWarnings,
  all => all.form
)

export const getDismissedTimelineWarnings: Selector<DismissedWarningsAllSteps<CommandCreatorWarning>> = createSelector(
  getAllDismissedWarnings,
  all => all.timeline
)

export const getTimelineWarningsPerStep: Selector<DismissedWarningsAllSteps<CommandCreatorWarning>> = createSelector(
  getDismissedTimelineWarnings,
  timelineWarningsPerStep,
  stepFormSelectors.getOrderedStepIds,
  (dismissedWarnings, warningsPerStep, orderedStepIds) => {
    return orderedStepIds.reduce(
      (stepAcc: DismissedWarningsAllSteps<CommandCreatorWarning>, stepId) => {
        const warningsForCurrentStep = warningsPerStep[stepId]
        const dismissedWarningsForStep = dismissedWarnings[stepId] || []

        if (!warningsForCurrentStep) return stepAcc

        // warnings match when their `type` is the same.
        // their `message` doesn't matter.
        const visibleWarnings = warningsForCurrentStep.filter(warning =>
          dismissedWarningsForStep.every(d => d.type !== warning.type)
        )

        return {
          ...stepAcc,
          [stepId]: visibleWarnings,
        }
      }, {})
  }
)

export const getTimelineWarningsForSelectedStep: Selector<Array<CommandCreatorWarning>> = createSelector(
  getTimelineWarningsPerStep,
  stepsSelectors.getSelectedStepId,
  (warningsPerStep, stepId) =>
    (stepId != null && warningsPerStep[stepId]) || []
)

export const getDismissedFormWarningsForSelectedStep: Selector<Array<FormWarning>> = createSelector(
  getDismissedFormWarnings,
  stepsSelectors.getSelectedStepId,
  (dismissedWarnings, stepId) =>
    (stepId != null && dismissedWarnings[stepId]) || []
)

/** Non-dismissed form-level warnings for selected step */
export const getFormWarningsForSelectedStep: Selector<Array<FormWarning>> = createSelector(
  stepFormSelectors.getFormLevelWarningsForUnsavedForm,
  getDismissedFormWarningsForSelectedStep,
  (warnings, dismissedWarnings) => {
    const dismissedTypesForStep = dismissedWarnings.map(dw => dw.type)
    const formWarnings = warnings.filter(w => !dismissedTypesForStep.includes(w.type))
    return formWarnings
  }
)
