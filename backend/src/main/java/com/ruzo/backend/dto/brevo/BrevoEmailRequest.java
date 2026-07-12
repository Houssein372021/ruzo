package com.ruzo.backend.dto.brevo;

import java.util.List;

public record BrevoEmailRequest(
        BrevoEmailSender sender,
        List<BrevoEmailRecipient> to,
        String subject,
        String htmlContent,
        String textContent,
        BrevoEmailRecipient replyTo
) {
}
