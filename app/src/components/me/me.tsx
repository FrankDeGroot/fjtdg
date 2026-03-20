import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const Me = component$(() => {
  const isAuthenticated = useSignal<boolean | null>(null);

  useVisibleTask$(async () => {
    try {
      const response = await fetch('/.auth/me');
      const data = (await response.json()) as { clientPrincipal: unknown | null };
      isAuthenticated.value = data.clientPrincipal !== null;
    } catch {
      isAuthenticated.value = false;
    }
  });

  if (isAuthenticated.value === null) {
    return <div>Checking auth status...</div>;
  }

  return (
    <div>
      {isAuthenticated.value ? (
        <a href="/.auth/logout">Logout</a>
      ) : (
        <a href="/.auth/login/aad">Login</a>
      )}
    </div>
  );
});
