import { MfaFactor } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import {
  type MfaFactorsState,
  missingMfaFactorsErrorDataGuard,
  requireMfaFactorsErrorDataGuard,
} from '@/types/guard';

import type { ErrorHandlers } from './use-error-handler';
import useStartTotpBinding from './use-start-totp-binding';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
};

const useMfaVerificationErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding({ replace });

  const handleMfaRedirect = useCallback(
    (flow: UserMfaFlow, availableFactors: MfaFactor[]) => {
      const mfaFactorsState: MfaFactorsState = {
        availableFactors,
      };

      if (availableFactors.length > 1) {
        navigate({ pathname: `/${flow}` }, { replace, state: mfaFactorsState });
        return;
      }

      const factor = availableFactors[0];

      if (!factor) {
        return;
      }

      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        void startTotpBinding(availableFactors);
        return;
      }

      navigate({ pathname: `/${flow}/${factor}` }, { replace, state: mfaFactorsState });
    },
    [navigate, replace, startTotpBinding]
  );

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_mfa': (error) => {
        const [_, data] = validate(error.data, missingMfaFactorsErrorDataGuard);
        const missingFactors = data?.missingFactors ?? [];

        if (missingFactors.length === 0) {
          setToast(error.message);
          return;
        }

        handleMfaRedirect(UserMfaFlow.MfaBinding, missingFactors);
      },
      'session.mfa.require_mfa_verification': async (error) => {
        const [_, data] = validate(error.data, requireMfaFactorsErrorDataGuard);
        const availableFactors = data?.availableFactors ?? [];

        if (availableFactors.length === 0) {
          setToast(error.message);
          return;
        }

        handleMfaRedirect(UserMfaFlow.MfaVerification, availableFactors);
      },
    }),
    [handleMfaRedirect, setToast]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaVerificationErrorHandler;
