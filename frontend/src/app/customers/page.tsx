"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useCustomers } from "@/hooks/useCustomers";
import { useSegments } from "@/hooks/useSegments";
import { formatCurrency, formatDays, formatNumber } from "@/lib/utils";

export default function CustomersPage() {
  const { segments } = useSegments();
  const {
    customers,
    total,
    page,
    setPage,
    totalPages,
    filters,
    updateFilters,
    isLoading,
  } = useCustomers({ pageSize: 15 });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [sortBy, setSortBy] = useState<"monetary" | "recency" | "frequency" | "id">("monetary");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleSegmentChange = (segId: string) => {
    setSelectedSegment(segId);
    updateFilters({ segmentId: segId || undefined });
  };

  const handleSortChange = (field: "monetary" | "recency" | "frequency" | "id") => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };

  const handleExportCSV = () => {
    const headers = "CustomerID,Recency,Frequency,Monetary,RFMScore,KMeansCluster,Segment\n";
    const rows = customers
      .map(
        (c) =>
          `${c.id},${c.recency},${c.frequency},${c.monetary},${c.rfmScore || "444"},${c.kmeansCluster},"${c.segmentName}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segmentiq_customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, filter, and inspect individual customer RFM behavior and cohort assignments.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          size="sm"
          variant="outline"
          className="text-xs h-8"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV ({formatNumber(total)} records)
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-4 bg-card/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <Input
              placeholder="Search Customer ID or Segment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button type="submit" size="sm" variant="secondary" className="text-xs h-9">
              Search
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-48">
              <Select
                value={selectedSegment}
                onChange={(e) => handleSegmentChange(e.target.value)}
              >
                <option value="">All Segments ({formatNumber(total)})</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                onClick={() => handleSortChange("monetary")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  sortBy === "monetary"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Spend {sortBy === "monetary" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                onClick={() => handleSortChange("recency")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  sortBy === "recency"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recency {sortBy === "recency" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
              <button
                onClick={() => handleSortChange("frequency")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  sortBy === "frequency"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Orders {sortBy === "frequency" && (sortOrder === "desc" ? "↓" : "↑")}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Table */}
      <Card className="overflow-hidden border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-5">Customer ID</th>
                <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => handleSortChange("recency")}>
                  <div className="flex items-center gap-1">
                    Recency <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => handleSortChange("frequency")}>
                  <div className="flex items-center gap-1">
                    Frequency <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-foreground" onClick={() => handleSortChange("monetary")}>
                  <div className="flex items-center gap-1">
                    Monetary Spend <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="p-3.5">RFM Score</th>
                <th className="p-3.5">Cluster</th>
                <th className="p-3.5">Segment Persona</th>
                <th className="p-3.5 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <td className="p-3.5 pl-5 font-mono font-bold text-foreground">
                    <Link
                      href={`/customers/${c.id}`}
                      className="hover:text-primary hover:underline flex items-center gap-1"
                    >
                      #{c.id}
                    </Link>
                  </td>
                  <td className="p-3.5 text-foreground font-medium">
                    {formatDays(c.recency)}
                  </td>
                  <td className="p-3.5 text-foreground font-medium">
                    {formatNumber(c.frequency)} orders
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">
                    {formatCurrency(c.monetary)}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground text-[11px] font-semibold">
                      {c.rfmScore || "444"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      C{c.kmeansCluster}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${c.segmentColor || "#3b82f6"}15`,
                        color: c.segmentColor || "#3b82f6",
                      }}
                    >
                      <span>{c.segmentIcon || "👥"}</span>
                      <span>{c.segmentName}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <Link href={`/customers/${c.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border/40 text-xs text-muted-foreground">
          <span>
            Page <strong className="text-foreground">{page}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong> ({formatNumber(total)} total accounts)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 px-2.5 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
