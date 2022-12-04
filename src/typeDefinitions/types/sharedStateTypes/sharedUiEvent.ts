export type SharedUiEvent =
  | "openAclPlanOptions"
  | "openAclHoldMenu"
  | "openAclSortMenu"
  | "openAclToolsMenu"
  | "openAclTemplateMenu"
  | "aclCleanup"
  | "aclToggleHideTypeCol"
  | "aclToggleHideCodeCol"
  | "aclToggleHideHdgCol"
  | "aclToggleHideSpdCol"
  | "aclToggleHideHdgSpdBoth"
  | "openDepPlanOptions"
  | "openDepSortMenu"
  | "openDepTemplateMenu"
  | "openGpdPlanOptions"
  | "openGpdHoldMenu"
  | "openGpdMapOptions"
  | "openGpdToolsMenu"
  | "openGpdTemplateMenu"
  | "openPlansDisplayPlanOptions"
  | "openPlansDisplayTemplateMenu"
  | "planOptionsOpenMenu"
  // route menu button click
  | "routeMenuSetTrialPlan"
  | "routeMenuClickAppendStar"
  | "routeMenuClickAppendOplus"
  | "routeMenuSetEligibleOnly";
