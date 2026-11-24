import { useCallback, useEffect, useId, useState } from "react";
import { Check, ImageUp, Save, Upload } from "lucide-react";
import { adminApi } from "../../api/admin";
import { AdminImageUpload } from "../../components/admin/AdminImageUpload";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { useI18n } from "../../hooks/useI18n";
import type { HeroMedia, HeroMediaType, HomepageAdminSettings } from "../../types";

type PendingMedia = {
  mediaType: HeroMediaType;
  mediaUrl: string;
  originalFileName: string;
};

export function AdminHomepagePage() {
  const { language, t } = useI18n();
  const inputId = useId();
  const [settings, setSettings] = useState<HomepageAdminSettings | null>(null);
  const [discoverUrl, setDiscoverUrl] = useState("/collections/all");
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [posterUrl, setPosterUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const loadSettings = useCallback(() => {
    adminApi.homepageSettings()
      .then((data) => {
        setSettings(data);
        setDiscoverUrl(data.discoverUrl || "/collections/all");
      })
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (activeHeroMediaId = settings?.heroMedia?.id) => {
    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      const updated = await adminApi.updateHomepageSettings({ discoverUrl, activeHeroMediaId });
      setSettings(updated);
      setDiscoverUrl(updated.discoverUrl);
      setStatus(t("homepageSaved"));
      return updated;
    } catch {
      setError(t("apiUnavailable"));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadMedia = async (file?: File) => {
    if (!file) {
      return;
    }

    setError("");
    setStatus("");
    setIsUploading(true);
    try {
      const uploaded = await adminApi.uploadMedia(file);
      setPendingMedia({
        mediaType: uploaded.mediaType,
        mediaUrl: uploaded.url,
        originalFileName: uploaded.originalFileName,
      });
      setPosterUrl("");
    } catch {
      setError(t("uploadMediaError"));
    } finally {
      setIsUploading(false);
    }
  };

  const archiveAndActivateMedia = async () => {
    if (!pendingMedia) {
      return;
    }

    setError("");
    setStatus("");
    setIsSaving(true);
    try {
      const media = await adminApi.createHeroMedia({
        ...pendingMedia,
        posterUrl: posterUrl || undefined,
      });
      const updated = await adminApi.updateHomepageSettings({
        discoverUrl,
        activeHeroMediaId: media.id,
      });
      setSettings(updated);
      setPendingMedia(null);
      setPosterUrl("");
      setStatus(t("homepageSaved"));
    } catch {
      setError(t("apiUnavailable"));
    } finally {
      setIsSaving(false);
    }
  };

  const activateArchivedMedia = async (mediaId: string) => {
    await saveSettings(mediaId);
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <p className="admin-page-eyebrow">RÜZO</p>
        <h1 className="admin-page-heading">{t("homepageAdmin")}</h1>
      </div>

      {error ? <p className="admin-notice">{error}</p> : null}
      {status ? <p className="admin-notice">{status}</p> : null}

      <AdminPanel title={t("homepageSettings")}>
        <div className="grid max-w-3xl gap-4">
          <p className="text-sm leading-6 text-[#080808]/65">{t("homepageSettingsHint")}</p>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#444444]">
              {t("discoverButtonUrl")}
            </span>
            <input
              value={discoverUrl}
              onChange={(event) => setDiscoverUrl(event.target.value)}
              placeholder="/collections/all"
              className="admin-input"
            />
          </label>
          <button
            type="button"
            className="admin-primary-button w-fit"
            disabled={isSaving}
            onClick={() => saveSettings()}
          >
            <Save className="h-4 w-4" />
            {t("save")}
          </button>
        </div>
      </AdminPanel>

      <AdminPanel title={t("heroMedia")}>
        <div className="grid max-w-3xl gap-4">
          <label htmlFor={inputId} className="admin-secondary-button w-fit">
            <Upload className="h-4 w-4" />
            {isUploading ? t("uploading") : t("uploadHeroMedia")}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => uploadMedia(event.target.files?.[0])}
          />

          {pendingMedia ? (
            <div className="grid gap-4 border border-[#E5E5E5] p-4">
              <MediaPreview media={pendingMedia} posterUrl={posterUrl} />
              <p className="text-sm text-[#080808]/65">{pendingMedia.originalFileName}</p>
              {pendingMedia.mediaType === "VIDEO" ? (
                <AdminImageUpload
                  label={t("mediaPoster")}
                  value={posterUrl}
                  onChange={setPosterUrl}
                />
              ) : null}
              <button
                type="button"
                className="admin-primary-button w-fit"
                disabled={isSaving}
                onClick={archiveAndActivateMedia}
              >
                <ImageUp className="h-4 w-4" />
                {t("activateMedia")}
              </button>
            </div>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title={t("heroArchive")}>
        {settings?.archive.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {settings.archive.map((media) => {
              const isActive = media.id === settings.heroMedia?.id;
              return (
                <article key={media.id} className="grid content-start gap-3 border border-[#E5E5E5] p-3">
                  <MediaPreview media={media} posterUrl={media.posterUrl ?? ""} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#080808]">
                      {media.originalFileName || media.mediaUrl}
                    </p>
                    {media.createdAt ? (
                      <p className="mt-1 text-xs text-[#080808]/55">
                        {new Intl.DateTimeFormat(language === "ar" ? "ar-LB" : "en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(media.createdAt))}
                      </p>
                    ) : null}
                  </div>
                  {isActive ? (
                    <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#080808]">
                      <Check className="h-4 w-4" />
                      {t("activeMedia")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="admin-secondary-button w-fit"
                      disabled={isSaving}
                      onClick={() => activateArchivedMedia(media.id)}
                    >
                      {t("activateMedia")}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#080808]/60">{t("noSelectedProducts")}</p>
        )}
      </AdminPanel>
    </div>
  );
}

function MediaPreview({
  media,
  posterUrl,
}: {
  media: Pick<HeroMedia, "mediaType" | "mediaUrl">;
  posterUrl: string;
}) {
  if (media.mediaType === "VIDEO") {
    return (
      <video
        src={media.mediaUrl}
        poster={posterUrl || undefined}
        muted
        controls
        preload="metadata"
        className="aspect-video w-full bg-[#080808] object-cover"
      />
    );
  }

  return <img src={media.mediaUrl} alt="" className="aspect-video w-full bg-[#F7F7F7] object-cover" />;
}
