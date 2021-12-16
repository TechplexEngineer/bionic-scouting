import { SvelteComponentTyped } from 'svelte';

export interface ActiveNavLinkProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap['a']> {
  disabled?: boolean;
  href?: string;
}

export default class ActiveNavLink extends SvelteComponentTyped<
  ActiveNavLinkProps,
  { click: WindowEventMap['click'] },
  { default: {} }
> {}