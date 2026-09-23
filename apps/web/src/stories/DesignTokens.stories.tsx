import type { Meta } from '@storybook/react';
import { Badge } from '../components/ui/Badge';

const meta = { title: 'Foundations/Design tokens' } satisfies Meta;
export default meta;
export function Overview() { return <div className="stack"><h1>Portal design tokens</h1><div className="labels"><Badge>Open</Badge><Badge>priority:high</Badge><Badge>team:frontend</Badge></div><p className="muted">Semantic tokens support light/dark themes, visible focus, 4/8 spacing and reduced motion.</p></div>; }
