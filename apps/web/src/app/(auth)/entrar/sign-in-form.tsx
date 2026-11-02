'use client';

import { useActionState } from 'react';
import { Field } from '@/components/forms/field';
import { FormMessage } from '@/components/forms/form-message';
import { SubmitButton } from '@/components/forms/submit-button';
import { signInWithPassword, type AuthFormState } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';

const initialState: AuthFormState = { status: 'idle' };

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInWithPassword, initialState);
  const t = ptBR.auth.signIn;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <Field
        name="email"
        label={t.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <Field
        name="password"
        label={t.password}
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <SubmitButton label={t.submit} pendingLabel={t.submitting} />
    </form>
  );
}
