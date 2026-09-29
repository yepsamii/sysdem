import { Icon } from '../ui/Icon';
import { useUi } from '../../store/ui';

export function ComponentsTogglePill() {
  const componentsOpen = useUi((s) => s.componentsOpen);
  const toggleComponents = useUi((s) => s.toggleComponents);

  return (
    <div className="lg:hidden px-2 pt-2 bg-canvas">
      <button
        type="button"
        aria-label={componentsOpen ? 'Hide components' : 'Show components'}
        aria-expanded={componentsOpen}
        onClick={toggleComponents}
        className="inline-flex items-center gap-2 rounded-lg font-medium transition-colors select-none whitespace-nowrap bg-surface-2 text-fg hover:bg-surface-3 border border-border h-8 px-3 text-sm"
      >
        <Icon name="menu" size={15} />
        <span>Components</span>
      </button>
    </div>
  );
}
