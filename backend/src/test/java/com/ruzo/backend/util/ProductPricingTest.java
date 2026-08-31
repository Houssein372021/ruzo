package com.ruzo.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.ruzo.backend.entity.Product;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class ProductPricingTest {

    @Test
    void usesOriginalPriceWhenProductIsNotOnSale() {
        Product product = product("99", false, "79");

        assertEquals(new BigDecimal("99"), ProductPricing.effectivePrice(product));
        assertNull(ProductPricing.discountPercentage(product));
    }

    @Test
    void usesSalePriceAndCalculatesRoundedDiscountWhenSaleIsValid() {
        Product product = product("99", true, "79");

        assertEquals(new BigDecimal("79"), ProductPricing.effectivePrice(product));
        assertEquals(20, ProductPricing.discountPercentage(product));
    }

    @Test
    void rejectsSalePriceEqualToOriginalPrice() {
        assertThrows(
                IllegalArgumentException.class,
                () -> ProductPricing.validateProductPricing(new BigDecimal("99"), true, new BigDecimal("99"))
        );
    }

    @Test
    void rejectsSalePriceHigherThanOriginalPrice() {
        assertThrows(
                IllegalArgumentException.class,
                () -> ProductPricing.validateProductPricing(new BigDecimal("99"), true, new BigDecimal("110"))
        );
    }

    @Test
    void rejectsMissingSalePriceWhenSaleIsEnabled() {
        assertThrows(
                IllegalArgumentException.class,
                () -> ProductPricing.validateProductPricing(new BigDecimal("99"), true, null)
        );
    }

    private static Product product(String price, boolean onSale, String salePrice) {
        Product product = new Product();
        product.setPrice(new BigDecimal(price));
        product.setOnSale(onSale);
        product.setSalePrice(new BigDecimal(salePrice));
        return product;
    }
}
