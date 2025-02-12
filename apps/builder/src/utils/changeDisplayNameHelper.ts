import { get, toPath } from "lodash"
import { UpdateActionSlicePropsPayload } from "@/redux/currentApp/action/actionState"
import { UpdateComponentSlicePropsPayload } from "@/redux/currentApp/components/componentsPayload"
import {
  getInDependenciesMap,
  getRawTree,
} from "../redux/currentApp/executionTree/executionSelector"
import store from "../store"
import { hasDynamicStringSnippet } from "./evaluateDynamicString/utils"
import {
  convertPathToString,
  isAction,
  isWidget,
} from "./executionTreeHelper/utils"

export const changeDisplayNameHelper = (
  independenciesMap: Record<string, string[]>,
  seeds: Record<string, any>,
  oldDisplayName: string,
  newDisplayName: string,
  type: "displayName" | "globalDataKey" = "displayName",
) => {
  const updateWidgetSlice: UpdateComponentSlicePropsPayload[] = []
  const updateActionSlice: UpdateActionSlicePropsPayload[] = []
  Object.keys(independenciesMap).forEach((inDepPath) => {
    const paths = toPath(inDepPath)
    if (
      (type === "displayName" && oldDisplayName === paths[0]) ||
      (type === "globalDataKey" && oldDisplayName === paths[1])
    ) {
      const usedPaths = independenciesMap[inDepPath]
      usedPaths.forEach((usedPath) => {
        const usedPathArray = toPath(usedPath)
        const displayName =
          usedPathArray[0] === oldDisplayName
            ? newDisplayName
            : usedPathArray[0]
        const finalUsedPathArray = [...usedPathArray]
        finalUsedPathArray.splice(0, 1, displayName)
        const finalUsedPath = convertPathToString(finalUsedPathArray)
        const maybeDynamicStringValue = get(seeds, finalUsedPath)
        if (hasDynamicStringSnippet(maybeDynamicStringValue)) {
          const newDynamicStringValue = maybeDynamicStringValue.replace(
            oldDisplayName,
            newDisplayName,
          )
          const propsPath = convertPathToString(usedPathArray.slice(1))
          const seed = seeds[displayName]
          if (isAction(seed)) {
            updateActionSlice.push({
              displayName: displayName,
              actionID: seed.$actionID,
              propsSlice: {
                [propsPath]: newDynamicStringValue,
              },
            })
          }
          if (isWidget(seed)) {
            updateWidgetSlice.push({
              displayName: displayName,
              propsSlice: {
                [propsPath]: newDynamicStringValue,
              },
            })
          }
        }
      })
    }
  })

  return { updateWidgetSlice, updateActionSlice }
}

export const copyWidgetHelper = (
  oldDisplayName: string,
  newDisplayName: string,
) => {
  const rootState = store.getState()
  const independenciesMap = getInDependenciesMap(rootState)
  const seeds = getRawTree(rootState)
  const updatePathsMapValue: Record<string, unknown> = {}
  Object.keys(independenciesMap).forEach((inDepPath) => {
    const usedPaths = independenciesMap[inDepPath]
    usedPaths.forEach((usedPath) => {
      const usedPathArray = toPath(usedPath)
      const displayName = usedPathArray[0]
      if (displayName !== oldDisplayName) {
        return
      }
      const finalUsedPathArray = [...usedPathArray]
      const finalUsedPath = convertPathToString(finalUsedPathArray)
      const maybeDynamicStringValue = get(seeds, finalUsedPath)
      if (hasDynamicStringSnippet(maybeDynamicStringValue)) {
        const newDynamicStringValue = maybeDynamicStringValue.replace(
          oldDisplayName,
          newDisplayName,
        )
        const propsPath = convertPathToString(usedPathArray.slice(1))
        updatePathsMapValue[propsPath] = newDynamicStringValue
      }
    })
  })

  return updatePathsMapValue
}
