import { useI18n } from "../../hooks/useI18n";

export function AnnouncementBar() {
  const { t } = useI18n();
  const messages = [t("finalSaleTitle"), t("cashOnDelivery"), t("announcement")];
  const marqueeGroups = Array.from({ length: 8 }, (_, index) => index);

  return (
    <div
      aria-label={messages.join(" | ")}
      className="font-display relative z-50 flex h-[35px] overflow-hidden border-b border-[#080808]/10 bg-[#080808] text-[1.2rem] font-normal tracking-[0.04em] text-[#FFFFFF] sm:text-[1.3rem]"
    >
      <div aria-hidden="true" className="announcement-marquee flex min-w-max items-center">
        {marqueeGroups.map((group) => (
          <div key={group} className="announcement-marquee-group flex shrink-0 items-center">
            {messages.map((message, index) => (
              <span key={`${group}-${message}-${index}`} className="flex items-center whitespace-nowrap px-7">
                {message}
                <span className="ms-7 h-1 w-1 rounded-full bg-[#FFFFFF]/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
