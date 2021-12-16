import { SvelteComponentTyped } from 'svelte';

export interface ActiveDropdownItemProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap['button']> {
  active?: boolean;
  disabled?: boolean;
  divider?: boolean;
  header?: boolean;
  href?: string;
  toggle?: boolean;
}

export default class ActiveDropdownItem extends SvelteComponentTyped<
  ActiveDropdownItemProps,
  { click: WindowEventMap['click'] },
  { default: {} }
> {}