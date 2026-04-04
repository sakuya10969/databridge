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
    <div ref={parentRef} className="overflow-auto border rounded-md" style={{ maxHeight: 400 }}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-3 py-2 text-left font-medium text-gray-600 border-b whitespace-nowrap"
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
                className="absolute w-full border-b hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-gray-700 whitespace-nowrap">
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
