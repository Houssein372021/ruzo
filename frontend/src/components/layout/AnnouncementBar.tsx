import { useI18n } from "../../hooks/useI18n";

export function AnnouncementBar() {
  const { t } = useI18n();
  const messages = [t("announcement"), t("finalSaleTitle"), t("cashOnDelivery")];
  const marqueeGroups = Array.from({ length: 8 }, (_, index) => index);

  return (
    <div
      aria-label={messages.join(" | ")}
      className="relative z-50 flex h-[35px] overflow-hidden bg-[#4B2E24] text-[11px] font-semibold uppercase tracking-display text-[#F8F4EC]"
    >
      <div aria-hidden="true" className="announcement-marquee flex min-w-max items-center">
        {marqueeGroups.map((group) => (
          <div key={group} className="announcement-marquee-group flex shrink-0 items-center">
            {messages.map((message, index) => (
              <span key={`${group}-${message}-${index}`} className="flex items-center whitespace-nowrap px-7">
                {message}
                <span className="ms-7 h-1 w-1 rounded-full bg-[#D8C3A5]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
