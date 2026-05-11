import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Table, Code, FileJson, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { parseFile } from "@/lib/parseFile";
import { setActiveDatasetId } from "@/hooks/useActiveDataset";
import { toast } from "sonner";

const fileTypes = [
  { ext: "CSV", icon: <Table className="w-4 h-4" /> },
  { ext: "Excel", icon: <FileText className="w-4 h-4" /> },
  { ext: "JSON", icon: <FileJson className="w-4 h-4" /> },
  { ext: "XML", icon: <Code className="w-4 h-4" /> },
];

export function FileUploadZone() {
  const [uploaded, setUploaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      if (!user) {
        toast.error("Please log in to upload datasets.");
        navigate({ to: "/login" });
        return;
      }
      const file = acceptedFiles[0];
      setFileName(file.name);
      setBusy(true);
      try {
        const parsed = await parseFile(file);
        const { data: inserted, error } = await supabase
          .from("datasets")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: parsed.fileType,
            row_count: parsed.rowCount,
            column_count: parsed.columnCount,
            health_score: parsed.healthScore,
            status: "Analyzed",
            summary: parsed.summary,
            schema: parsed.schema as any,
            sample: parsed.sample as any,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (inserted?.id) setActiveDatasetId(inserted.id);
        setUploaded(true);
        toast.success(`${file.name} analyzed — chat is now scoped to this dataset`);
        setTimeout(() => {
          navigate({ to: "/analysis" });
        }, 900);
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [user, navigate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: busy,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/xml": [".xml"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <div className="space-y-4">
      <motion.div
        {...(getRootProps() as any)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/5"
            : uploaded
            ? "border-sage bg-sage/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30"
        } ${busy ? "opacity-70 cursor-wait" : ""}`}
      >
        <input {...getInputProps()} />
        <motion.div animate={{ y: isDragActive ? -5 : 0 }} className="flex flex-col items-center gap-4">
          {busy ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Analyzing {fileName}…</p>
            </>
          ) : uploaded ? (
            <>
              <CheckCircle className="w-12 h-12 text-sage" />
              <div>
                <p className="text-lg font-medium">{fileName} uploaded!</p>
                <p className="text-sm text-muted-foreground mt-1">Opening analysis…</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-accent/50">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isDragActive ? "Drop your file here" : "Drag & drop your data file"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2">
        {fileTypes.map((type) => (
          <div key={type.ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-xs text-muted-foreground">
            {type.icon}
            {type.ext}
          </div>
        ))}
      </div>
    </div>
  );
}
