import { isCloudVersion } from "@illa-public/utils"
import { FC, memo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { Loading } from "@illa-design/react"
import { getDashboardTeamAIAgentList } from "@/redux/aiAgent/dashboardTeamAIAgentSelector"
import ActionPanelSection from "./components/ActionSection"
import AgentPanelSection from "./components/AgentSection"
import {
  MORE_DATA_TYPE_SELF_HOST,
  RECOMMEND_RESOURCES_CLOUD,
  RECOMMEND_RESOURCES_SELF_HOST,
} from "./constans"
import {
  guidePanelContainerStyle,
  guidePanelOutContainerStyle,
  loadingContainerStyle,
} from "./style"

const ActionGuidePanel: FC = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const agenList = useSelector(getDashboardTeamAIAgentList)

  return (
    <>
      <div css={guidePanelOutContainerStyle}>
        <div css={guidePanelContainerStyle}>
          {!isCloudVersion ? (
            <>
              <ActionPanelSection
                title={t(
                  "editor.action.panel.label.general.connect-data-source",
                )}
                actionTypes={RECOMMEND_RESOURCES_SELF_HOST}
                changeLoading={setIsLoading}
                hasMore
              />
              <ActionPanelSection
                title={t("editor.action.panel.label.general.more-type")}
                actionTypes={MORE_DATA_TYPE_SELF_HOST}
                changeLoading={setIsLoading}
                hasMore={false}
              />
            </>
          ) : (
            <>
              <AgentPanelSection
                title={t("editor.action.panel.label.general.more-type")}
                agents={agenList}
                hasMore
                changeLoading={setIsLoading}
              />
              <ActionPanelSection
                title={t(
                  "editor.action.panel.label.general.connect-data-source",
                )}
                actionTypes={RECOMMEND_RESOURCES_CLOUD}
                changeLoading={setIsLoading}
                hasMore
              />
            </>
          )}
          {isLoading && (
            <div css={loadingContainerStyle}>
              <Loading colorScheme="techPurple" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default memo(ActionGuidePanel)
