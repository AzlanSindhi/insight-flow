import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Table, Code, FileJson, CheckCircle } from "lucide-react";

const fileTypes = [
  { ext: "CSV", icon: <Table className="w-4 h-4" /> },
  { ext: "Excel", icon: <FileText className="w-4 h-4" /> },
  { ext: "JSON", icon: <FileJson className="w-4 h-4" /> },
  { ext: "XML", icon: <Code className="w-4 h-4" /> },
];

export function FileUploadZone() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFileName(acceptedFiles[0].name);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ y: isDragActive ? -5 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          {uploaded ? (
            <>
              <CheckCircle className="w-12 h-12 text-sage" />
              <div>
                <p className="text-lg font-medium text-foreground">{fileName} uploaded!</p>
                <p className="text-sm text-muted-foreground mt-1">Processing your data...</p>
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
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse from your computer
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2">
        {fileTypes.map((type) => (
          <div
            key={type.ext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-xs text-muted-foreground"
          >
            {type.icon}
            {type.ext}
          </div>
        ))}
      </div>
    </div>
  );
}
