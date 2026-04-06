import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface PreviewTableProps {
  columns: string[];
  rows: Record<string, string>[];
}

export function PreviewTable({ columns, rows }: PreviewTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const columnHelper = createColumnHelper<Record<string, string>>();
  const tableCols = columns.map((col) =>
    columnHelper.accessor(col, {
      header: col,
      cell: (info) => info.getValue(),
    })
  );

  const table = useReactTable({
    data: rows,
    columns: tableCols,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-xl border border-border bg-[rgba(11,19,38,0.56)]"
      style={{ maxHeight: 400 }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#0d1730]">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="border-b border-border px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.06em] whitespace-nowrap text-muted-foreground"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                className="absolute w-full border-b border-[#162038] hover:bg-[rgba(38,101,253,0.06)]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-[13px] text-foreground whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
