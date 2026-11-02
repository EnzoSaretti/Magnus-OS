import { StatusChip } from '@magnus/ui';
import { PLATFORM_ITEMS } from '@/content/modules';
import { ptBR } from '@/content/pt-BR';
import { Panel } from './panel';

/** Real delivery status of each capability (not demonstration data). */
export function PlatformStatus() {
  const d = ptBR.dashboard.platform;

  return (
    <Panel id="plataforma" title={d.title} actions={<p className="text-xs text-graphite-500">{d.caption}</p>}>
      <ul className="grid border-t border-graphite-800 lg:grid-cols-2 lg:gap-x-10">
        {PLATFORM_ITEMS.map((item) => (
          <li key={item.key} className="flex items-center gap-4 border-b border-graphite-800 py-3.5">
            <span className="w-10 shrink-0 text-sm tabular-nums text-graphite-500">
              {ptBR.shell.phaseShort(item.phase)}
            </span>
            <span className="flex-1 text-[0.95rem] text-mist-100">{ptBR.platformItems[item.key]}</span>
            <StatusChip tone={item.status}>{ptBR.status[item.status]}</StatusChip>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
