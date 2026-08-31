package com.ruzo.backend.util;

import com.ruzo.backend.entity.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class ProductPricing {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private ProductPricing() {
    }

    public static boolean hasValidSale(Product product) {
        if (product == null) {
            return false;
        }
        return hasValidSale(product.getPrice(), product.getOnSale(), product.getSalePrice());
    }

    public static boolean hasValidSale(BigDecimal price, Boolean onSale, BigDecimal salePrice) {
        return Boolean.TRUE.equals(onSale)
                && price != null
                && price.compareTo(BigDecimal.ZERO) > 0
                && salePrice != null
                && salePrice.compareTo(BigDecimal.ZERO) > 0
                && salePrice.compareTo(price) < 0;
    }

    public static BigDecimal effectivePrice(Product product) {
        if (product == null || product.getPrice() == null) {
            return BigDecimal.ZERO;
        }
        return hasValidSale(product) ? product.getSalePrice() : product.getPrice();
    }

    public static Integer discountPercentage(Product product) {
        if (!hasValidSale(product)) {
            return null;
        }
        BigDecimal discount = product.getPrice()
                .subtract(product.getSalePrice())
                .multiply(ONE_HUNDRED)
                .divide(product.getPrice(), 0, RoundingMode.HALF_UP);
        int roundedDiscount = discount.intValue();
        return roundedDiscount > 0 ? roundedDiscount : null;
    }

    public static void validateProductPricing(BigDecimal price, Boolean onSale, BigDecimal salePrice) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (Boolean.TRUE.equals(onSale) && !hasValidSale(price, onSale, salePrice)) {
            throw new IllegalArgumentException("Sale price must be greater than 0 and lower than the original price");
        }
    }
}
