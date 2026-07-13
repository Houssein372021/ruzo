import { useId, useState } from "react";
import { ImageUp } from "lucide-react";
import { adminApi } from "../../api/admin";
import { useI18n } from "../../hooks/useI18n";

type AdminImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AdminImageUpload({ label, value, onChange }: AdminImageUploadProps) {
  const { t } = useI18n();
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (file?: File) => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      const response = await adminApi.uploadImage(file);
      onChange(response.url);
    } catch {
      setError(t("uploadImageError"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B0F1A]">
        {label}
      </span>
      <div className="grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/api/uploads/image.png"
            className="admin-input"
          />
          <label htmlFor={inputId} className="admin-secondary-button">
            <ImageUp className="h-4 w-4" />
            {isUploading ? t("uploading") : t("browse")}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => handleFileChange(event.target.files?.[0])}
          />
        </div>
        {error ? <p className="text-xs text-red-700">{error}</p> : null}
        {value ? <img src={value} alt="" className="aspect-video w-full border border-[#080808]/10 object-cover" /> : null}
      </div>
    </div>
  );
}
