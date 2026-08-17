"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { api } from "@/lib/api";

export default function NewDatasetPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      handleFileSelected(selected);
    }
  };

  const handleFileSelected = (selected: File) => {
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      setError("Please upload a valid CSV or Excel (.xlsx/.xls) file.");
      return;
    }
    setError(null);
    setFile(selected);
    if (!datasetName) {
      setDatasetName(selected.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!datasetName.trim()) {
      setError("Please provide a name for this dataset.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Simulate/Trigger upload
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 25;
        });
      }, 200);

      const res = await api.uploadDataset(file, datasetName);
      setUploadProgress(100);

      // Route to validation step
      router.push(`/datasets/new/validate?datasetId=${res.datasetId}&name=${encodeURIComponent(datasetName)}`);
    } catch {
      setError("Upload failed. Please verify the file format and try again.");
      setIsUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb Back Link */}
        <Link
          href="/datasets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Datasets
        </Link>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Upload New Dataset
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step 1 of 2: Upload transaction data and configure your dataset source.
          </p>
        </div>

        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Transaction Source</CardTitle>
            <CardDescription className="text-xs">
              Upload raw transaction lines containing customer identifiers, timestamps, and order values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleContinue} className="space-y-5">
              {/* Dropzone */}
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/20 transition-all rounded-xl p-8 text-center cursor-pointer space-y-3"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Supports CSV, XLSX, or XLS (Up to 100MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file-input"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
                    }}
                  />
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-4 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for validation
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Uploading dataset...</span>
                    <span className="font-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Dataset Name Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Dataset Name
                </label>
                <Input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. Q1 2024 Customer Transactions"
                  icon={<FileText className="w-4 h-4" />}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <Link href="/datasets">
                  <Button type="button" variant="ghost" size="sm" className="text-xs">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold h-9 shadow-sm"
                  disabled={!file || isUploading}
                >
                  Continue to Data Validation <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
