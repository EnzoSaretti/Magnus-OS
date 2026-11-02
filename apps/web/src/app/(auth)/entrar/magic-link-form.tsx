'use client';

import { useActionState } from 'react';
import { Field } from '@/components/forms/field';
import { FormMessage } from '@/components/forms/form-message';
import { SubmitButton } from '@/components/forms/submit-button';
import { sendMagicLink, type AuthFormState } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';

const initialState: AuthFormState = { status: 'idle' };

export function MagicLinkForm({ next }: { next: string }) {
  const [state, action] = useActionState(sendMagicLink, initialState);
  const t = ptBR.auth.signIn;

  if (state.status === 'sent') {
    return <FormMessage tone="info">{t.magicLinkSent}</FormMessage>;
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <p className="text-sm leading-6 text-mist-300">{t.magicLinkHelp}</p>
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <Field
        id="magic-email"
        name="email"
        label={t.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <SubmitButton label={t.magicLinkSubmit} pendingLabel={t.magicLinkSubmitting} variant="secondary" />
    </form>
  );
}
