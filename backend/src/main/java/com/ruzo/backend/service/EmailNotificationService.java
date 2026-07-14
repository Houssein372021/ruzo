package com.ruzo.backend.service;

import com.ruzo.backend.config.SmtpEmailConfig;
import com.ruzo.backend.entity.Order;
import com.ruzo.backend.entity.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailNotificationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(EmailNotificationService.class);
  private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final SmtpEmailConfig smtpEmailConfig;
  private final JavaMailSender mailSender;

  public EmailNotificationService(SmtpEmailConfig smtpEmailConfig, JavaMailSender mailSender) {
    this.smtpEmailConfig = smtpEmailConfig;
    this.mailSender = mailSender;
  }

  public void sendOrderConfirmationEmailToCustomer(Order order) {
    if (!StringUtils.hasText(order.getEmail())) {
      LOGGER.warn("Skipping customer order confirmation email for order {} because customer email is blank",
          order.getId());
      return;
    }

    sendEmail(
        new EmailRecipient(order.getEmail(), customerName(order)),
        customerEmailSubject(order),
        buildCustomerEmail(order),
        buildCustomerText(order));
  }

  public void sendOrderNotificationEmailToOwner(Order order) {
    if (!StringUtils.hasText(smtpEmailConfig.ownerEmail())) {
      LOGGER.warn("Skipping owner order notification email for order {} because SITE_OWNER_EMAIL is blank",
          order.getId());
      return;
    }

    sendEmail(
        new EmailRecipient(smtpEmailConfig.ownerEmail(), "RÜZO"),
        ownerEmailSubject(order),
        buildOwnerEmail(order),
        buildOwnerText(order));
  }

  public void sendOrderShippedEmailToCustomer(Order order) {
    if (!StringUtils.hasText(order.getEmail())) {
      LOGGER.warn("Skipping customer shipping email for order {} because customer email is blank", order.getId());
      return;
    }

    sendEmail(
        new EmailRecipient(order.getEmail(), customerName(order)),
        shippedEmailSubject(order),
        buildShippedEmail(order),
        buildShippedText(order));
  }

  public void sendReviewRequestEmailToCustomer(Order order) {
    if (!StringUtils.hasText(order.getEmail())) {
      LOGGER.warn("Skipping customer review request email for order {} because customer email is blank", order.getId());
      return;
    }
    if (!StringUtils.hasText(order.getReviewToken())) {
      LOGGER.warn("Skipping customer review request email for order {} because review token is blank", order.getId());
      return;
    }

    sendEmail(
        new EmailRecipient(order.getEmail(), customerName(order)),
        reviewRequestEmailSubject(order),
        buildReviewRequestEmail(order),
        buildReviewRequestText(order));
  }

  public void sendOrderEmails(Order order) {
    runSafely("customer confirmation", order, () -> sendOrderConfirmationEmailToCustomer(order));
    runSafely("owner notification", order, () -> sendOrderNotificationEmailToOwner(order));
  }

  public void sendOrderShippedEmail(Order order) {
    runSafely("customer shipping notification", order, () -> sendOrderShippedEmailToCustomer(order));
  }

  public void sendReviewRequestEmail(Order order) {
    runSafely("customer review request", order, () -> sendReviewRequestEmailToCustomer(order));
  }

  private void sendEmail(EmailRecipient recipient, String subject, String htmlContent, String textContent) {
    if (!smtpEmailConfig.isEnabled()) {
      LOGGER.warn("Skipping SMTP email '{}' to {} because SMTP credentials are not configured", subject,
          recipient.email());
      return;
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(smtpEmailConfig.senderEmail(), smtpEmailConfig.senderName());
      helper.setReplyTo(smtpEmailConfig.senderEmail(), smtpEmailConfig.senderName());
      helper.setTo(recipient.email());
      helper.setSubject(subject);
      helper.setText(textContent, htmlContent);
      mailSender.send(message);
      LOGGER.info("Sent SMTP email '{}' to {}", subject, recipient.email());
    } catch (MessagingException exception) {
      throw new IllegalStateException("Failed to build SMTP email message", exception);
    } catch (java.io.UnsupportedEncodingException exception) {
      throw new IllegalStateException("Failed to encode SMTP sender name", exception);
    }
  }

  private void runSafely(String emailType, Order order, Runnable action) {
    try {
      action.run();
    } catch (MailException exception) {
      LOGGER.error("SMTP rejected {} email for order {}", emailType, order.getId(), exception);
    } catch (Exception exception) {
      LOGGER.error("Failed to send {} email for order {}", emailType, order.getId(), exception);
    }
  }

  private String customerEmailSubject(Order order) {
    return isArabic(order)
        ? "تم تأكيد طلبك " + safeOrderNumber(order)
        : "Order " + safeOrderNumber(order) + " confirmed";
  }

  private String ownerEmailSubject(Order order) {
    return isArabic(order) ? "طلب جديد " + safeOrderNumber(order) : "New order " + safeOrderNumber(order);
  }

  private String shippedEmailSubject(Order order) {
    return isArabic(order)
        ? "تم شحن طلبك " + safeOrderNumber(order)
        : "Order " + safeOrderNumber(order) + " shipped";
  }

  private String reviewRequestEmailSubject(Order order) {
    return isArabic(order)
        ? "تقييم طلبك " + safeOrderNumber(order)
        : "Review order " + safeOrderNumber(order);
  }

  private boolean isArabic(Order order) {
    return order != null && "ar".equalsIgnoreCase(order.getLanguage());
  }

  private String buildCustomerEmail(Order order) {
    return isArabic(order) ? buildCustomerEmailAr(order) : buildCustomerEmailEn(order);
  }

  private String buildCustomerEmailEn(Order order) {
    String items = orderItems(order).stream()
        .map(item -> customerItemRow(item, false))
        .collect(Collectors.joining());

    return """
        <!doctype html>
        <html>
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">Order confirmation</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">Thank you, %s.</h1>
                <p style="line-height:1.7;color:#080808;">Thank you for your order. We'll notify you when your order is on the way.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>Order number:</strong> %s
                </div>
                <table style="width:100%%;border-collapse:collapse;margin-top:24px;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Item</th>
                      <th align="center" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Qty</th>
                      <th align="right" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <div style="margin-top:24px;text-align:right;font-size:18px;">
                  <strong>Total: %s</strong>
                </div>
                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E6E6E6;">
                  <p style="margin:0 0 8px;color:#6B0F1A;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Delivery address</p>
                  <p style="margin:0;line-height:1.7;">%s</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order)),
            escape(order.getOrderNumber()),
            items,
            formatMoney(order.getTotal()),
            escape(deliveryAddress(order)));
  }

  private String buildCustomerEmailAr(Order order) {
    String items = orderItems(order).stream()
        .map(item -> customerItemRow(item, true))
        .collect(Collectors.joining());

    return """
        <!doctype html>
        <html lang="ar" dir="rtl">
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;direction:rtl;text-align:right;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">تأكيد الطلب</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">شكرا لك، %s.</h1>
                <p style="line-height:1.7;color:#080808;">شكرا لطلبك. سنخبرك عندما يكون طلبك في الطريق إليك.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>رقم الطلب:</strong> %s
                </div>
                <table style="width:100%%;border-collapse:collapse;margin-top:24px;">
                  <thead>
                    <tr>
                      <th align="right" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">المنتج</th>
                      <th align="center" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">الكمية</th>
                      <th align="left" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <div style="margin-top:24px;text-align:left;font-size:18px;">
                  <strong>الإجمالي: %s</strong>
                </div>
                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E6E6E6;">
                  <p style="margin:0 0 8px;color:#6B0F1A;font-size:12px;text-transform:uppercase;letter-spacing:2px;">عنوان التوصيل</p>
                  <p style="margin:0;line-height:1.7;">%s</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order, true)),
            escape(order.getOrderNumber()),
            items,
            formatMoney(order.getTotal()),
            escape(deliveryAddress(order)));
  }

  private String buildShippedEmail(Order order) {
    return isArabic(order) ? buildShippedEmailAr(order) : buildShippedEmailEn(order);
  }

  private String buildReviewRequestEmail(Order order) {
    return isArabic(order) ? buildReviewRequestEmailAr(order) : buildReviewRequestEmailEn(order);
  }

  private String buildReviewRequestEmailEn(Order order) {
    String reviewLink = reviewLink(order);
    return """
        <!doctype html>
        <html>
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">Verified review</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">How did your RÜZO pieces feel?</h1>
                <p style="line-height:1.7;color:#080808;">Hi %s, your order has been delivered. We would love to hear your experience with the pieces you purchased.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>Order number:</strong> %s
                </div>
                <a href="%s" style="display:inline-block;background:#6B0F1A;color:#FFFFFF;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Write a review</a>
                <p style="margin:24px 0 0;line-height:1.7;color:#080808;">Your review will appear on the site after admin approval.</p>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order)),
            escape(order.getOrderNumber()),
            escape(reviewLink));
  }

  private String buildReviewRequestEmailAr(Order order) {
    String reviewLink = reviewLink(order);
    return """
        <!doctype html>
        <html lang="ar" dir="rtl">
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;direction:rtl;text-align:right;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">تقييم مؤكد</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">كيف كانت تجربتك مع قطع RÜZO؟</h1>
                <p style="line-height:1.7;color:#080808;">مرحبا %s، تم تسليم طلبك. يسعدنا أن تشاركي تجربتك مع القطع التي اشتريتها.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>رقم الطلب:</strong> %s
                </div>
                <a href="%s" style="display:inline-block;background:#6B0F1A;color:#FFFFFF;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">اكتبي تقييما</a>
                <p style="margin:24px 0 0;line-height:1.7;color:#080808;">سيظهر تقييمك على الموقع بعد موافقة الإدارة.</p>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order, true)),
            escape(order.getOrderNumber()),
            escape(reviewLink));
  }

  private String buildCustomerText(Order order) {
    if (isArabic(order)) {
      return """
          تم تأكيد طلبك من RÜZO.
          رقم الطلب: %s
          الإجمالي: %s
          عنوان التوصيل: %s

          سنخبرك عندما يكون طلبك في الطريق إليك.
          """.formatted(
          safeOrderNumber(order),
          formatMoney(order.getTotal()),
          deliveryAddress(order));
    }

    return """
        Your RÜZO order has been confirmed.
        Order number: %s
        Total: %s
        Delivery address: %s

        We will notify you when your order is on the way.
        """.formatted(
        safeOrderNumber(order),
        formatMoney(order.getTotal()),
        deliveryAddress(order));
  }

  private String buildShippedText(Order order) {
    if (isArabic(order)) {
      return """
          تم شحن طلبك من RÜZO.
          رقم الطلب: %s
          الإجمالي: %s
          عنوان التوصيل: %s
          """.formatted(
          safeOrderNumber(order),
          formatMoney(order.getTotal()),
          deliveryAddress(order));
    }

    return """
        Your RÜZO order has shipped.
        Order number: %s
        Total: %s
        Delivery address: %s
        """.formatted(
        safeOrderNumber(order),
        formatMoney(order.getTotal()),
        deliveryAddress(order));
  }

  private String buildReviewRequestText(Order order) {
    if (isArabic(order)) {
      return """
          تم تسليم طلبك من RÜZO.
          يمكنك كتابة تقييم مؤكد من هذا الرابط:
          %s

          سيظهر تقييمك على الموقع بعد موافقة الإدارة.
          """.formatted(reviewLink(order));
    }

    return """
        Your RÜZO order has been delivered.
        You can write a verified review here:
        %s

        Your review will appear on the site after admin approval.
        """.formatted(reviewLink(order));
  }

  private String buildOwnerText(Order order) {
    return """
        New RÜZO order received.
        Order number: %s
        Customer: %s
        Email: %s
        Phone: %s
        Total: %s
        """.formatted(
        safeOrderNumber(order),
        customerName(order),
        firstNonBlank(order.getEmail(), "-"),
        firstNonBlank(order.getPhone(), "-"),
        formatMoney(order.getTotal()));
  }

  private String buildShippedEmailEn(Order order) {
    return """
        <!doctype html>
        <html>
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">Shipping update</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">Your order is on the way.</h1>
                <p style="line-height:1.7;color:#080808;">Good news, %s. Your RÜZO order has been sent to delivery.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>Order number:</strong> %s
                </div>
                <table style="width:100%%;border-collapse:collapse;">
                  %s
                  %s
                  %s
                </table>
                <p style="margin:28px 0 0;line-height:1.7;color:#080808;">We'll contact you if any additional delivery details are needed.</p>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order)),
            escape(order.getOrderNumber()),
            summaryRow("Delivery address", deliveryAddress(order)),
            summaryRow("Order status", "Shipped"),
            summaryRow("Total", formatMoney(order.getTotal())));
  }

  private String buildShippedEmailAr(Order order) {
    return """
        <!doctype html>
        <html lang="ar" dir="rtl">
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;direction:rtl;text-align:right;">
            <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:28px;text-align:center;">
                <div style="font-size:26px;letter-spacing:10px;font-weight:700;">RÜZO</div>
              </div>
              <div style="background:#FFFFFF;padding:32px;border:1px solid #E6E6E6;">
                <p style="margin:0 0 8px;color:#6B0F1A;letter-spacing:3px;text-transform:uppercase;font-size:12px;">تحديث التوصيل</p>
                <h1 style="margin:0 0 20px;font-size:28px;font-weight:400;">طلبك في الطريق إليك.</h1>
                <p style="line-height:1.7;color:#080808;">خبر جميل، %s. تم إرسال طلبك من RÜZO إلى التوصيل.</p>
                <div style="margin:24px 0;padding:18px;background:#FFFFFF;border:1px solid #E6E6E6;">
                  <strong>رقم الطلب:</strong> %s
                </div>
                <table style="width:100%%;border-collapse:collapse;">
                  %s
                  %s
                  %s
                </table>
                <p style="margin:28px 0 0;line-height:1.7;color:#080808;">سنتواصل معك إذا احتجنا إلى أي تفاصيل إضافية للتسليم.</p>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            escape(customerName(order, true)),
            escape(order.getOrderNumber()),
            summaryRow("عنوان التوصيل", deliveryAddress(order)),
            summaryRow("حالة الطلب", "تم الشحن"),
            summaryRow("الإجمالي", formatMoney(order.getTotal())));
  }

  private String buildOwnerEmail(Order order) {
    return isArabic(order) ? buildOwnerEmailAr(order) : buildOwnerEmailEn(order);
  }

  private String buildOwnerEmailEn(Order order) {
    String items = orderItems(order).stream()
        .map(item -> ownerItemRow(item, false))
        .collect(Collectors.joining());

    return """
        <!doctype html>
        <html>
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;">
            <div style="max-width:720px;margin:0 auto;padding:28px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:24px;">
                <div style="font-size:24px;letter-spacing:10px;font-weight:700;">RÜZO</div>
                <p style="margin:14px 0 0;color:#FFFFFF;">New order received</p>
              </div>
              <div style="background:#FFFFFF;padding:28px;border:1px solid #E6E6E6;">
                %s
                <h2 style="margin:28px 0 12px;font-size:18px;">Products</h2>
                <table style="width:100%%;border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Item</th>
                      <th align="center" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Qty</th>
                      <th align="right" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <div style="margin-top:24px;text-align:right;font-size:18px;">
                  <strong>Total: %s</strong>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            ownerSummary(order, false),
            items,
            formatMoney(order.getTotal()));
  }

  private String buildOwnerEmailAr(Order order) {
    String items = orderItems(order).stream()
        .map(item -> ownerItemRow(item, true))
        .collect(Collectors.joining());

    return """
        <!doctype html>
        <html lang="ar" dir="rtl">
          <body style="margin:0;background:#FFFFFF;font-family:Arial,sans-serif;color:#080808;direction:rtl;text-align:right;">
            <div style="max-width:720px;margin:0 auto;padding:28px 20px;">
              <div style="background:#6B0F1A;color:#FFFFFF;padding:24px;">
                <div style="font-size:24px;letter-spacing:10px;font-weight:700;">RÜZO</div>
                <p style="margin:14px 0 0;color:#FFFFFF;">تم استلام طلب جديد</p>
              </div>
              <div style="background:#FFFFFF;padding:28px;border:1px solid #E6E6E6;">
                %s
                <h2 style="margin:28px 0 12px;font-size:18px;">المنتجات</h2>
                <table style="width:100%%;border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th align="right" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">المنتج</th>
                      <th align="center" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">الكمية</th>
                      <th align="left" style="padding:10px 0;border-bottom:1px solid #E6E6E6;color:#6B0F1A;font-size:12px;text-transform:uppercase;">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <div style="margin-top:24px;text-align:left;font-size:18px;">
                  <strong>الإجمالي: %s</strong>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        .formatted(
            ownerSummary(order, true),
            items,
            formatMoney(order.getTotal()));
  }

  private String ownerSummary(Order order, boolean arabic) {
    return """
        <table style="width:100%%;border-collapse:collapse;">
          %s
          %s
          %s
          %s
          %s
          %s
          %s
          %s
          %s
          %s
        </table>
        """.formatted(
        summaryRow(label("Order number", "رقم الطلب", arabic), order.getOrderNumber()),
        summaryRow(label("Date", "التاريخ", arabic),
            order.getCreatedAt() == null ? "" : order.getCreatedAt().format(ORDER_DATE_FORMAT)),
        summaryRow(label("Customer", "العميل", arabic), customerName(order, arabic)),
        summaryRow(label("Email", "البريد الإلكتروني", arabic), order.getEmail()),
        summaryRow(label("Phone", "الهاتف", arabic), order.getPhone()),
        summaryRow(label("WhatsApp", "واتساب", arabic), order.getWhatsapp()),
        summaryRow(label("Delivery address", "عنوان التوصيل", arabic), deliveryAddress(order)),
        summaryRow(label("Payment method", "طريقة الدفع", arabic), displayPaymentMethod(order, arabic)),
        summaryRow(label("Status", "حالة الطلب", arabic), displayStatus(order, arabic)),
        summaryRow(label("Notes", "ملاحظات", arabic), order.getNotes()));
  }

  private String summaryRow(String label, String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }

    return """
        <tr>
          <td style="width:180px;padding:8px 0;color:#6B0F1A;font-size:12px;text-transform:uppercase;letter-spacing:2px;">%s</td>
          <td style="padding:8px 0;color:#080808;">%s</td>
        </tr>
        """
        .formatted(escape(label), escape(value));
  }

  private String customerItemRow(OrderItem item, boolean arabic) {
    String productAlign = arabic ? "right" : "left";
    String totalAlign = arabic ? "left" : "right";

    return """
        <tr>
          <td align="%s" style="padding:14px 0;border-bottom:1px solid #E6E6E6;">
            <strong>%s</strong>
            <div style="margin-top:4px;color:#6B0F1A;font-size:13px;">%s</div>
          </td>
          <td align="center" style="padding:14px 0;border-bottom:1px solid #E6E6E6;">%d</td>
          <td align="%s" style="padding:14px 0;border-bottom:1px solid #E6E6E6;">%s</td>
        </tr>
        """.formatted(
        productAlign,
        escape(itemName(item)),
        escape(itemOptions(item, arabic)),
        item.getQuantity() == null ? 0 : item.getQuantity(),
        totalAlign,
        formatMoney(item.getTotalPrice()));
  }

  private String ownerItemRow(OrderItem item, boolean arabic) {
    return customerItemRow(item, arabic);
  }

  private List<OrderItem> orderItems(Order order) {
    return order.getItems() == null ? Collections.emptyList() : order.getItems();
  }

  private String itemName(OrderItem item) {
    return firstNonBlank(item.getProductName(), item.getProductTitle(), "RÜZO item");
  }

  private String itemOptions(OrderItem item, boolean arabic) {
    return Stream.of(
        option(label("Color", "اللون", arabic), item.getColor()),
        option(label("Size", "المقاس", arabic), item.getSize()))
        .filter(StringUtils::hasText)
        .collect(Collectors.joining(" / "));
  }

  private String option(String label, String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return label + ": " + value;
  }

  private String customerName(Order order) {
    return customerName(order, false);
  }

  private String customerName(Order order, boolean arabic) {
    return firstNonBlank(
        Stream.of(order.getFirstName(), order.getLastName())
            .filter(StringUtils::hasText)
            .collect(Collectors.joining(" ")),
        arabic ? "عميلة RÜZO" : "RÜZO customer");
  }

  private String deliveryAddress(Order order) {
    return Stream.of(order.getAddress(), order.getCity())
        .filter(StringUtils::hasText)
        .collect(Collectors.joining(", "));
  }

  private String displayPaymentMethod(Order order, boolean arabic) {
    String paymentMethod = order.getPaymentMethod();
    if (!StringUtils.hasText(paymentMethod) || "Not specified".equalsIgnoreCase(paymentMethod)) {
      return arabic ? "غير محدد" : "Not specified";
    }
    return paymentMethod;
  }

  private String displayStatus(Order order, boolean arabic) {
    if (order.getStatus() == null) {
      return "";
    }

    if (!arabic) {
      return order.getStatus().name();
    }

    return switch (order.getStatus()) {
      case NEW -> "جديد";
      case CONFIRMED -> "مؤكد";
      case PROCESSING -> "قيد المعالجة";
      case SHIPPED -> "تم الشحن";
      case DELIVERED -> "تم التسليم";
      case CANCELLED -> "ملغي";
    };
  }

  private String label(String english, String arabic, boolean useArabic) {
    return useArabic ? arabic : english;
  }

  private String reviewLink(Order order) {
    String baseUrl = StringUtils.hasText(smtpEmailConfig.publicUrl())
        ? smtpEmailConfig.publicUrl()
        : "https://www.rüzo.com";
    return baseUrl.replaceAll("/+$", "") + "/review/" + order.getReviewToken();
  }

  private String safeOrderNumber(Order order) {
    return firstNonBlank(order.getOrderNumber(), "RÜZO order");
  }

  private String firstNonBlank(String... values) {
    return Stream.of(values)
        .filter(StringUtils::hasText)
        .findFirst()
        .orElse("");
  }

  private String formatMoney(BigDecimal value) {
    if (value == null) {
      return "$0.00";
    }
    return "$" + value.setScale(2, java.math.RoundingMode.HALF_UP);
  }

  private String escape(String value) {
    return HtmlUtils.htmlEscape(value == null ? "" : value);
  }

  private record EmailRecipient(String email, String name) {
  }
}
