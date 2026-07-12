package com.ruzo.backend.service;

import com.ruzo.backend.dto.CreateOrderItemRequest;
import com.ruzo.backend.dto.CreateOrderRequest;
import com.ruzo.backend.entity.*;
import com.ruzo.backend.repository.CustomerRepository;
import com.ruzo.backend.repository.OrderRepository;
import com.ruzo.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Objects;
import java.util.UUID;
import java.util.Optional;

@Service
public class OrderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final EmailNotificationService emailNotificationService;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            EmailNotificationService emailNotificationService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        LocalDateTime now = LocalDateTime.now();

        Customer customer = findExistingCustomer(request)
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setCreatedAt(now);
                    return newCustomer;
                });
        customer.setFirstName(requiredText(request.resolvedFirstName()));
        customer.setLastName(requiredText(request.resolvedLastName()));
        customer.setEmail(requiredText(request.resolvedEmail()));
        customer.setPhone(requiredText(request.resolvedPhone()));
        customer.setWhatsapp(request.resolvedWhatsapp());
        customer.setCountry(requiredText(request.resolvedCountry()));
        customer.setAddress(requiredText(request.resolvedAddress()));
        customer.setCity(requiredText(request.resolvedCity()));
        customer.setUpdatedAt(now);
        customerRepository.save(customer);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);

        order.setFirstName(customer.getFirstName());
        order.setLastName(customer.getLastName());
        order.setEmail(customer.getEmail());
        order.setPhone(customer.getPhone());
        order.setWhatsapp(customer.getWhatsapp());
        order.setAddress(customer.getAddress());
        order.setCity(customer.getCity());
        order.setNotes(request.resolvedNotes());
        order.setLanguage(request.resolvedLanguage());
        order.setPaymentMethod(firstNonBlank(request.resolvedPaymentMethod(), "Not specified"));
        order.setReviewToken(UUID.randomUUID().toString().replace("-", ""));
        order.setStatus(OrderStatus.NEW);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        BigDecimal subtotal = BigDecimal.ZERO;
        ArrayList<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderItemRequest itemRequest : request.items()) {
            UUID productId = Objects.requireNonNull(itemRequest.productId(), "Product id is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Product is no longer available"));

            int quantity = itemRequest.quantity() == null || itemRequest.quantity() < 1
                    ? 1
                    : itemRequest.quantity();
            BigDecimal unitPrice = itemRequest.unitPrice() == null ? product.getPrice() : itemRequest.unitPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            String productName = firstNonBlank(itemRequest.productName(), product.getNameEn(), product.getSlug());
            String color = requiredText(itemRequest.color());
            String size = requiredText(itemRequest.size());

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(productName);
            item.setProductTitle(productName);
            item.setColor(color);
            item.setColorName(color);
            item.setSize(size);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(itemTotal);

            subtotal = subtotal.add(itemTotal);
            orderItems.add(item);
        }

        BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.valueOf(70)) > 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(7);

        BigDecimal total = subtotal.add(deliveryFee);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(total);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        try {
            emailNotificationService.sendOrderEmails(savedOrder);
        } catch (Exception exception) {
            LOGGER.error("Failed to send order emails for order {}", savedOrder.getId(), exception);
        }

        return savedOrder;
    }

    private String generateOrderNumber() {
        return "RÜZO-" + System.currentTimeMillis();
    }

    private String requiredText(String value) {
        return value == null ? "" : value;
    }

    private Optional<Customer> findExistingCustomer(CreateOrderRequest request) {
        String email = request.resolvedEmail();
        if (email != null && !email.isBlank()) {
            Optional<Customer> customer = customerRepository.findFirstByEmailIgnoreCase(email.trim());
            if (customer.isPresent()) {
                return customer;
            }
        }

        String phone = request.resolvedPhone();
        if (phone != null && !phone.isBlank()) {
            Optional<Customer> customer = customerRepository.findFirstByPhone(phone.trim());
            if (customer.isPresent()) {
                return customer;
            }
        }

        String whatsapp = request.resolvedWhatsapp();
        if (whatsapp != null && !whatsapp.isBlank()) {
            return customerRepository.findFirstByWhatsapp(whatsapp.trim());
        }

        return Optional.empty();
    }

    private String firstNonBlank(String... values) {
        return Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse("");
    }
}
