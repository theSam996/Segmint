"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Plus,
  Search,
  MoreVertical,
  Play,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Copy,
  Edit2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useDatasets } from "@/hooks/useDatasets";
import { formatNumber, formatDate } from "@/lib/utils";
import { Dataset } from "@/types/dataset";

export default function DatasetsPage() {
  const { datasets, selectedDataset, setSelectedDataset } = useDatasets();
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = datasets.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadges = {
    uploaded: <Badge variant="secondary">Uploaded</Badge>,
    validating: <Badge variant="warning">Validating</Badge>,
    ready: <Badge variant="purple">Ready to Analyze</Badge>,
    processing: <Badge variant="warning">Processing...</Badge>,
    completed: <Badge variant="success">Completed</Badge>,
    failed: <Badge variant="danger">Failed</Badge>,
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            My Datasets
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your raw transaction sources, schema validations, and analysis pipelines.
          </p>
        </div>

        <Link href="/datasets/new">
          <Button size="sm" variant="primary" className="text-xs h-8 shadow-sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Dataset
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="max-w-xs w-full">
          <Input
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> datasets
        </span>
      </div>

      {/* Datasets Table / Cards */}
      <div className="space-y-3">
        {filtered.map((ds) => (
          <Card
            key={ds.id}
            className="hover:border-border transition-all p-4 bg-card/90"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Info */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex-shrink-0 mt-0.5">
                  <Database className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                      {ds.name}
                    </h3>
                    {statusBadges[ds.status]}
                    {selectedDataset?.id === ds.id && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-primary/15 text-primary rounded font-semibold border border-primary/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <FileText className="w-3.5 h-3.5" /> {ds.filename}
                    </span>
                    <span>
                      <strong className="text-foreground">
                        {formatNumber(ds.validRowCount || ds.rowCount)}
                      </strong>{" "}
                      valid transactions
                    </span>
                    {ds.customerCount && (
                      <span>
                        <strong className="text-foreground">
                          {formatNumber(ds.customerCount)}
                        </strong>{" "}
                        unique customers
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" /> Created {formatDate(ds.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 relative">
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDataset(ds)}
                    className="text-xs h-8"
                  >
                    Open Dashboard
                  </Button>
                </Link>
                <Link href="/analysis/run-demo-001/processing">
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs h-8 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Analyze
                  </Button>
                </Link>

                {/* More Menu Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === ds.id ? null : ds.id)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenu === ds.id && (
                    <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-border bg-card p-1 shadow-lg z-50 text-xs">
                      <button
                        onClick={() => setActiveMenu(null)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={() => setActiveMenu(null)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left text-foreground"
                      >
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                      <div className="border-t border-border/40 my-1" />
                      <button
                        onClick={() => setActiveMenu(null)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-rose-500/10 text-left text-rose-500 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <Database className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No datasets found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No datasets match your search query. Upload a transaction CSV or Excel file to get started.
              </p>
              <Link href="/datasets/new">
                <Button size="sm" variant="primary" className="text-xs mt-2">
                  Upload Dataset
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
