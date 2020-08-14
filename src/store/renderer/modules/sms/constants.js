import router from '@/common/huawei-router-api';

const routerBoxTypes = router.sms.boxTypes;

export const boxTypes = {
  LOCAL_INBOX: 'LOCAL_INBOX',
  LOCAL_SENT: 'LOCAL_SENT',
  LOCAL_DRAFT: 'LOCAL_DRAFT',
  LOCAL_TRASH: 'LOCAL_TRASH',
  SIM_INBOX: 'SIM_INBOX',
  SIM_SENT: 'SIM_SENT',
  SIM_DRAFT: 'SIM_DRAFT',
};

/**
 * Maps box types to the properties returned by the API: getSmsCount
 */
export const mapBoxTypeToApi = {
  [boxTypes.LOCAL_INBOX]: 'LocalInbox',
  [boxTypes.LOCAL_SENT]: 'LocalOutbox',
  [boxTypes.LOCAL_DRAFT]: 'LocalDraft',
  [boxTypes.LOCAL_TRASH]: 'LocalDeleted',
  [boxTypes.SIM_INBOX]: 'SimInbox',
  [boxTypes.SIM_SENT]: 'SimOutbox',
  [boxTypes.SIM_DRAFT]: 'SimDraft',
};

/**
 * Maps box types to the router API's internal boxTypes
 */
export const mapBoxTypeToRouterBoxType = {
  [boxTypes.LOCAL_INBOX]: routerBoxTypes.INBOX,
  [boxTypes.LOCAL_SENT]: routerBoxTypes.SENT,
  [boxTypes.LOCAL_DRAFT]: routerBoxTypes.DRAFT,
  [boxTypes.LOCAL_TRASH]: routerBoxTypes.TRASH,
  [boxTypes.SIM_INBOX]: routerBoxTypes.SIM_INBOX,
  [boxTypes.SIM_SENT]: routerBoxTypes.SIM_SENT,
  [boxTypes.SIM_DRAFT]: routerBoxTypes.SIM_DRAFT,
};
