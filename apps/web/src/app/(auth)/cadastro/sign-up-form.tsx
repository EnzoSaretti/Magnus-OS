'use client';

import { useActionState } from 'react';
import { Field } from '@/components/forms/field';
import { FormMessage } from '@/components/forms/form-message';
import { SubmitButton } from '@/components/forms/submit-button';
import { signUp, type AuthFormState } from '@/lib/auth/actions';
import { ptBR } from '@/content/pt-BR';

const initialState: AuthFormState = { status: 'idle' };

export function SignUpForm() {
  const [state, action] = useActionState(signUp, initialState);
  const t = ptBR.auth.signUp;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <Field
        name="fullName"
        label={t.fullName}
        autoComplete="name"
        required
        defaultValue={state.fullName}
        error={state.fieldErrors?.fullName}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={72}
        hint={t.passwordHelp}
        error={state.fieldErrors?.password}
      />
      <SubmitButton label={t.submit} pendingLabel={t.submitting} />
    </form>
  );
}
