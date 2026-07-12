package com.ruzo.backend.dto;

import java.util.List;

public record CreateOrderRequest(
        CustomerRequest customer,
        String firstName,
        String lastName,
        String email,
        String phone,
        String whatsapp,
        String country,
        String address,
        String city,
        String notes,
        String language,
        String paymentMethod,
        List<CreateOrderItemRequest> items
) {
    public String resolvedFirstName() {
        return firstValue(firstName, customer == null ? null : customer.firstName());
    }

    public String resolvedLastName() {
        return firstValue(lastName, customer == null ? null : customer.lastName());
    }

    public String resolvedEmail() {
        return firstValue(email, customer == null ? null : customer.email());
    }

    public String resolvedPhone() {
        return firstValue(phone, customer == null ? null : customer.phone());
    }

    public String resolvedWhatsapp() {
        return firstValue(whatsapp, customer == null ? null : customer.whatsapp());
    }

    public String resolvedCountry() {
        return firstValue(country, customer == null ? null : customer.country());
    }

    public String resolvedAddress() {
        return firstValue(address, customer == null ? null : customer.address());
    }

    public String resolvedCity() {
        return firstValue(city, customer == null ? null : customer.city());
    }

    public String resolvedNotes() {
        return firstValue(notes, customer == null ? null : customer.notes());
    }

    public String resolvedPaymentMethod() {
        return firstValue(paymentMethod, null);
    }

    public String resolvedLanguage() {
        return "ar".equalsIgnoreCase(firstValue(language, null)) ? "ar" : "en";
    }

    private static String firstValue(String primary, String fallback) {
        if (primary != null) {
            return primary;
        }
        return fallback;
    }

    public record CustomerRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String whatsapp,
            String country,
            String city,
            String address,
            String notes
    ) {
    }
}
