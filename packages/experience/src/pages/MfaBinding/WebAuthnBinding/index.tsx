import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import Button from '@/components/Button';
import SwitchMfaFactorsLink from '@/components/SwitchMfaFactorsLink';
import useBindWebAuthn from '@/hooks/use-bind-webauthn';
import useMfaFactorsState from '@/hooks/use-mfa-factors-state';
import ErrorPage from '@/pages/ErrorPage';
import { UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';

const WebAuthnBinding = () => {
  const mfaFactorsState = useMfaFactorsState();
  const bindWebAuthn = useBindWebAuthn();

  if (!mfaFactorsState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { availableFactors } = mfaFactorsState;

  return (
    <SecondaryPageLayout title="mfa.create_a_passkey" description="mfa.create_passkey_description">
      <Button title="mfa.create_a_passkey" onClick={bindWebAuthn} />
      {availableFactors.length > 1 && (
        <SwitchMfaFactorsLink
          flow={UserMfaFlow.MfaBinding}
          factors={availableFactors}
          className={styles.switchLink}
        />
      )}
    </SecondaryPageLayout>
  );
};

export default WebAuthnBinding;
