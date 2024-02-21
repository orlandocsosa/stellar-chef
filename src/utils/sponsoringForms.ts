import ChangeTrustForm from '../components/sponsoringResources/ChangeTrustForm.svelte';
import CreateAccountForm from '../components/sponsoringResources/CreateAccountForm.svelte';
import CreateClaimableBalanceForm from '../components/sponsoringResources/CreateClaimableBalanceForm.svelte';
import ManageDataForm from '../components/sponsoringResources/ManageDataForm.svelte';

import { buildChangeTrustOperation } from '../services/stellar/operations/changeTrust';
import { buildCreateAccountOperation } from '../services/stellar/operations/createAccount';
import { buildManageDataOperation } from '../services/stellar/operations/manageData';
import { buildCreateClaimableBalanceOperation } from '../services/stellar/operations/createClaimableBalanceOperation';

export const sponsoringForms = [
  {
    type: 'change-trust',
    component: ChangeTrustForm,
    operation: buildChangeTrustOperation
  },
  {
    type: 'create-account',
    component: CreateAccountForm,
    operation: buildCreateAccountOperation
  },
  {
    type: 'manage-data',
    component: ManageDataForm,
    operation: buildManageDataOperation
  },
  {
    type: 'Create-Claimable-Balance',
    component: CreateClaimableBalanceForm,
    operation: buildCreateClaimableBalanceOperation
  }
];
