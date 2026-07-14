package com.ruzo.backend.controller;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.ruzo.backend.entity.Category;
import com.ruzo.backend.entity.Customer;
import com.ruzo.backend.entity.Order;
import com.ruzo.backend.entity.OrderItem;
import com.ruzo.backend.entity.OrderStatus;
import com.ruzo.backend.entity.Product;
import com.ruzo.backend.entity.ProductImage;
import com.ruzo.backend.entity.ProductVariant;
import com.ruzo.backend.repository.CategoryRepository;
import com.ruzo.backend.repository.CustomerRepository;
import com.ruzo.backend.repository.OrderRepository;
import com.ruzo.backend.repository.ProductImageRepository;
import com.ruzo.backend.repository.ProductRepository;
import com.ruzo.backend.repository.ProductVariantRepository;
import com.ruzo.backend.repository.ReviewRepository;
import com.ruzo.backend.service.EmailNotificationService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.lang.NonNull;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminController.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ReviewRepository reviewRepository;
    private final JdbcTemplate jdbcTemplate;
    private final EmailNotificationService emailNotificationService;

    public AdminController(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ReviewRepository reviewRepository,
            JdbcTemplate jdbcTemplate,
            EmailNotificationService emailNotificationService) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.reviewRepository = reviewRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.emailNotificationService = emailNotificationService;
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        List<Order> orders = findOrdersSafely();
        List<Product> products = productRepository.findAll();
        List<CustomerResponse> customers = getCustomerResponses();

        BigDecimal totalSales = sumOrderTotals(orders);

        return new DashboardResponse(
                orders.size(),
                totalSales,
                orders.stream().limit(5).map(AdminOrderResponse::from).toList(),
                products.stream().limit(5).map(ProductResponse::from).toList(),
                customers.stream().limit(5).toList());
    }

    @GetMapping("/products")
    @Transactional(readOnly = true)
    public List<ProductResponse> products() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @PostMapping("/products")
    @Transactional
    public ProductResponse createProduct(@RequestBody ProductRequest request) {
        Product product = new Product();
        applyProductRequest(product, request);
        Product saved = productRepository.save(product);
        replaceProductMedia(saved, request);
        return ProductResponse.from(saved);
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable @NonNull UUID id,
            @RequestBody ProductRequest request) {
        return productRepository.findById(Objects.requireNonNull(id, "Product id is required"))
                .map(product -> {
                    Product existingProduct = Objects.requireNonNull(product, "Product must not be null");
                    applyProductRequest(existingProduct, request);
                    Product saved = productRepository.save(existingProduct);
                    replaceProductMedia(saved, request);
                    return ResponseEntity.ok(ProductResponse.from(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable @NonNull UUID id) {
        UUID productId = Objects.requireNonNull(id, "Product id is required");
        if (!productRepository.existsById(productId)) {
            return ResponseEntity.notFound().build();
        }

        reviewRepository.deleteByProduct_Id(productId);
        productImageRepository.deleteByProduct_Id(productId);
        productVariantRepository.deleteByProduct_Id(productId);
        productRepository.deleteById(productId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/products/featured-menu")
    @Transactional
    public List<ProductResponse> updateFeaturedMenu(@RequestBody FeaturedMenuRequest request) {
        List<UUID> productIds = request.productIds() == null ? List.of() : request.productIds().stream()
                .filter(Objects::nonNull)
                .toList();

        if (productIds.size() > 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Featured menu accepts up to 4 products");
        }
        if (productIds.stream().distinct().count() != productIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Featured menu products must be unique");
        }

        List<Product> products = productRepository.findAll();
        products.forEach(product -> {
            product.setFeaturedMenu(false);
            product.setFeaturedMenuOrder(null);
        });

        for (int index = 0; index < productIds.size(); index++) {
            UUID productId = productIds.get(index);
            Product product = products.stream()
                    .filter(candidate -> productId.equals(candidate.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
            product.setFeaturedMenu(true);
            product.setFeaturedMenuOrder(index + 1);
        }

        productRepository.saveAll(products);

        return products.stream()
                .filter(product -> Boolean.TRUE.equals(product.getFeaturedMenu()))
                .sorted((first, second) -> Integer.compare(
                        first.getFeaturedMenuOrder() == null ? Integer.MAX_VALUE : first.getFeaturedMenuOrder(),
                        second.getFeaturedMenuOrder() == null ? Integer.MAX_VALUE : second.getFeaturedMenuOrder()))
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder"));
    }

    @PostMapping("/categories")
    public Category createCategory(@RequestBody CategoryRequest request) {
        Category category = new Category();
        applyCategoryRequest(category, request);
        category.setCreatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable @NonNull UUID id,
            @RequestBody CategoryRequest request) {
        UUID categoryId = Objects.requireNonNull(id, "Category id is required");
        return categoryRepository.findById(categoryId)
                .map(category -> {
                    Category safeCategory = Objects.requireNonNull(category, "Category must not be null");
                    applyCategoryRequest(safeCategory, request);
                    return ResponseEntity.ok(categoryRepository.save(safeCategory));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable @NonNull UUID id) {
        UUID categoryId = Objects.requireNonNull(id, "Category id is required");
        if (!categoryRepository.existsById(categoryId)) {
            return ResponseEntity.notFound().build();
        }

        categoryRepository.deleteById(categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public List<AdminOrderResponse> orders() {
        return findOrdersSafely().stream()
                .map(AdminOrderResponse::from)
                .toList();
    }

    @DeleteMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<Void> deleteOrder(@PathVariable @NonNull UUID id) {
        UUID orderId = Objects.requireNonNull(id, "Order id is required");
        return orderRepository.findById(orderId)
                .map(order -> {
                    reviewRepository.deleteByOrder_Id(order.getId());
                    orderRepository.delete(order);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(
            @PathVariable @NonNull UUID id,
            @RequestBody OrderStatusRequest request) {
        UUID orderId = Objects.requireNonNull(id, "Order id is required");
        return orderRepository.findById(orderId)
                .map(order -> {
                    if (request.status() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status is required");
                    }

                    OrderStatus previousStatus = order.getStatus();
                    OrderStatus nextStatus = request.status();

                    if (order.getReviewToken() == null || order.getReviewToken().isBlank()) {
                        order.setReviewToken(UUID.randomUUID().toString().replace("-", ""));
                    }
                    order.setStatus(nextStatus);
                    Order savedOrder = orderRepository.save(order);

                    if (previousStatus != OrderStatus.SHIPPED && nextStatus == OrderStatus.SHIPPED) {
                        emailNotificationService.sendOrderShippedEmail(savedOrder);
                    }
                    if (nextStatus == OrderStatus.DELIVERED && savedOrder.getReviewRequestSentAt() == null) {
                        emailNotificationService.sendReviewRequestEmail(savedOrder);
                        savedOrder.setReviewRequestSentAt(LocalDateTime.now());
                        savedOrder = orderRepository.save(savedOrder);
                    }

                    return ResponseEntity.ok(AdminOrderResponse.from(savedOrder));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/customers")
    @Transactional(readOnly = true)
    public List<CustomerResponse> customers() {
        return getCustomerResponses();
    }

    @DeleteMapping("/customers/{id}")
    @Transactional
    public ResponseEntity<Void> deleteCustomer(@PathVariable @NonNull UUID id) {
        UUID customerId = Objects.requireNonNull(id, "Customer id is required");
        return customerRepository.findById(customerId)
                .map(customer -> {
                    String key = customerGroupKey(customer);
                    findCustomersSafely().stream()
                            .filter(candidate -> customerGroupKey(candidate).equals(key))
                            .forEach(candidate -> {
                                UUID candidateId = Objects.requireNonNull(candidate.getId(),
                                        "Customer id must not be null");
                                reviewRepository.deleteByOrder_Customer_Id(candidateId);
                                orderRepository.findByCustomer_Id(candidateId).forEach(orderRepository::delete);
                                customerRepository.delete(candidate);
                            });
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private void applyProductRequest(Product product, ProductRequest request) {
        product.setSlug(request.slug());
        if (request.categoryId() != null) {
            UUID categoryId = Objects.requireNonNull(request.categoryId(), "Category id is required");
            product.setCategory(categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found")));
        } else if (product.getCategory() == null) {
            categoryRepository.findBySlug("sets").ifPresent(product::setCategory);
        }
        product.setTitleEn(request.nameEn());
        product.setTitleAr(request.nameAr());
        product.setNameEn(request.nameEn());
        product.setNameAr(request.nameAr());
        product.setShortDescriptionEn(request.shortDescriptionEn());
        product.setShortDescriptionAr(request.shortDescriptionAr());
        product.setDescriptionEn(request.descriptionEn());
        product.setDescriptionAr(request.descriptionAr());
        product.setPrice(request.price() == null ? BigDecimal.ZERO : request.price());
        product.setActive(request.active() == null || request.active());
        product.setVideoUrl(request.videoUrl());
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
        product.setUpdatedAt(LocalDateTime.now());
    }

    private void replaceProductMedia(Product product, ProductRequest request) {
        productImageRepository.deleteByProduct_Id(product.getId());
        productVariantRepository.deleteByProduct_Id(product.getId());

        product.getImages().clear();
        product.getVariants().clear();

        List<ImageRequest> imageRequests = request.images();
        if (imageRequests.isEmpty() && request.imageUrl() != null && !request.imageUrl().isBlank()) {
            imageRequests = List.of(new ImageRequest(request.imageUrl(), 1));
        }

        for (int index = 0; index < imageRequests.size(); index++) {
            ImageRequest imageRequest = imageRequests.get(index);
            if (imageRequest.imageUrl() == null || imageRequest.imageUrl().isBlank()) {
                continue;
            }

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(imageRequest.imageUrl());
            image.setSortOrder(imageRequest.sortOrder() == null ? index + 1 : imageRequest.sortOrder());
            product.getImages().add(productImageRepository.save(image));
        }

        for (VariantRequest variantRequest : request.variants()) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setColor(variantRequest.color());
            variant.setColorHex(variantRequest.colorHex());
            variant.setSize(variantRequest.size());
            variant.setStock(variantRequest.stock() == null ? 0 : variantRequest.stock());
            variant.setImageUrl(variantRequest.imageUrl());
            ProductVariant savedVariant = productVariantRepository.save(variant);
            product.getVariants().add(savedVariant);
        }
    }

    private void applyCategoryRequest(Category category, CategoryRequest request) {
        category.setSlug(request.slug());
        category.setNameEn(request.nameEn());
        category.setNameAr(request.nameAr());
        category.setImageUrl(request.imageUrl());
        category.setSortOrder(request.sortOrder());
        category.setIsActive(request.isActive());
    }

    private List<CustomerResponse> getCustomerResponses() {
        List<Order> orders = findOrdersSafely();
        Map<UUID, List<Order>> ordersByCustomerId = orders.stream()
                .filter(order -> order.getCustomer() != null)
                .collect(Collectors.groupingBy(order -> order.getCustomer().getId()));

        Map<String, CustomerGroup> groups = new LinkedHashMap<>();
        for (Customer customer : findCustomersSafely()) {
            String key = customerGroupKey(customer);
            groups.computeIfAbsent(key, ignored -> new CustomerGroup()).add(
                    customer,
                    ordersByCustomerId.getOrDefault(customer.getId(), List.of()));
        }

        return groups.values().stream()
                .map((CustomerGroup group) -> group.toResponse())
                .sorted((first, second) -> second.lastOrderSortValue().compareTo(first.lastOrderSortValue()))
                .toList();
    }

    private List<Order> findOrdersSafely() {
        if (!tableUsesUuidId("orders")) {
            return List.of();
        }

        try {
            return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } catch (RuntimeException exception) {
            LOGGER.warn("Admin orders are unavailable because the existing orders table does not match UUID mappings.");
            return List.of();
        }
    }

    private List<Customer> findCustomersSafely() {
        if (!tableUsesUuidId("customers")) {
            return List.of();
        }

        try {
            return customerRepository.findAll();
        } catch (RuntimeException exception) {
            LOGGER.warn(
                    "Admin customers are unavailable because the existing customers table does not match UUID mappings.");
            return List.of();
        }
    }

    private boolean tableUsesUuidId(String tableName) {
        try {
            String dataType = jdbcTemplate.queryForObject(
                    """
                            select data_type
                            from information_schema.columns
                            where table_schema = current_schema()
                              and table_name = ?
                              and column_name = 'id'
                            """,
                    String.class,
                    tableName);
            return "uuid".equalsIgnoreCase(dataType);
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private String customerGroupKey(Customer customer) {
        String email = normalizeText(customer.getEmail());
        if (!email.isBlank()) {
            return "email:" + email;
        }

        String phone = normalizePhone(firstNonBlank(customer.getPhone(), customer.getWhatsapp()));
        if (!phone.isBlank()) {
            return "phone:" + phone;
        }

        return "customer:" + customer.getId();
    }

    private static String normalizeText(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static String normalizePhone(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private static String firstNonBlank(String preferred, String fallback) {
        return preferred != null && !preferred.isBlank() ? preferred : fallback;
    }

    private static BigDecimal sumOrderTotals(List<Order> orders) {
        BigDecimal total = BigDecimal.ZERO;
        for (Order order : orders) {
            BigDecimal orderTotal = order.getTotal();
            if (orderTotal != null) {
                total = total.add(orderTotal);
            }
        }
        return total;
    }

    public record DashboardResponse(
            int totalOrders,
            BigDecimal totalSales,
            List<AdminOrderResponse> recentOrders,
            List<ProductResponse> topProducts,
            List<CustomerResponse> recentCustomers) {
    }

    public record ProductRequest(
            String slug,
            String nameEn,
            String nameAr,
            String shortDescriptionEn,
            String shortDescriptionAr,
            String descriptionEn,
            String descriptionAr,
            BigDecimal price,
            UUID categoryId,
            String videoUrl,
            String imageUrl,
            Boolean active,
            List<ImageRequest> images,
            List<VariantRequest> variants) {
        public ProductRequest {
            images = images == null ? List.of() : images;
            variants = variants == null ? List.of() : variants;
        }
    }

    public record FeaturedMenuRequest(List<UUID> productIds) {
    }

    public record ImageRequest(
            @JsonAlias("url") String imageUrl,
            Integer sortOrder) {
    }

    public record VariantRequest(
            String color,
            String colorHex,
            String size,
            Integer stock,
            String imageUrl) {
    }

    public record CategoryRequest(
            String slug,
            String nameEn,
            String nameAr,
            String imageUrl,
            Boolean isActive,
            Integer sortOrder) {
    }

    public record OrderStatusRequest(OrderStatus status) {
    }

    public record AdminOrderResponse(
            UUID id,
            String orderNumber,
            String customerName,
            String customerPhone,
            String email,
            String phone,
            String whatsapp,
            String address,
            String city,
            String notes,
            String paymentMethod,
            String reviewToken,
            LocalDateTime reviewRequestSentAt,
            BigDecimal subtotal,
            BigDecimal deliveryFee,
            BigDecimal total,
            OrderStatus status,
            LocalDateTime createdAt,
            List<AdminOrderItemResponse> items,
            List<String> products) {
        static AdminOrderResponse from(Order order) {
            List<AdminOrderItemResponse> items = order.getItems() == null
                    ? List.of()
                    : order.getItems().stream()
                            .map((OrderItem item) -> AdminOrderItemResponse.from(item))
                            .toList();

            return new AdminOrderResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    customerName(order),
                    firstNonBlank(order.getWhatsapp(), order.getPhone()),
                    order.getEmail(),
                    order.getPhone(),
                    order.getWhatsapp(),
                    deliveryAddress(order),
                    order.getCity(),
                    order.getNotes(),
                    order.getPaymentMethod(),
                    order.getReviewToken(),
                    order.getReviewRequestSentAt(),
                    order.getSubtotal() == null ? BigDecimal.ZERO : order.getSubtotal(),
                    order.getDeliveryFee() == null ? BigDecimal.ZERO : order.getDeliveryFee(),
                    order.getTotal() == null ? BigDecimal.ZERO : order.getTotal(),
                    order.getStatus(),
                    order.getCreatedAt(),
                    items,
                    productNames(items));
        }

        private static String customerName(Order order) {
            String name = String.join(" ",
                    order.getFirstName() == null ? "" : order.getFirstName(),
                    order.getLastName() == null ? "" : order.getLastName()).trim();
            if (!name.isBlank()) {
                return name;
            }
            if (order.getCustomer() == null) {
                return "Guest";
            }
            return CustomerResponse.customerName(order.getCustomer());
        }

        private static String deliveryAddress(Order order) {
            String address = order.getAddress() == null ? "" : order.getAddress();
            String city = order.getCity() == null ? "" : order.getCity();
            return String.join(", ", address, city).replaceAll("^(,\\s*)|(,\\s*)$", "");
        }

        private static List<String> productNames(List<AdminOrderItemResponse> items) {
            List<String> names = new ArrayList<>();
            for (AdminOrderItemResponse item : items) {
                String name = item.productName();
                if (name != null && !name.isBlank()) {
                    names.add(name);
                }
            }
            return names;
        }
    }

    public record AdminOrderItemResponse(
            UUID id,
            String productName,
            String color,
            String size,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice) {
        static AdminOrderItemResponse from(OrderItem item) {
            return new AdminOrderItemResponse(
                    item.getId(),
                    item.getProductName(),
                    firstNonBlank(item.getColorName(), item.getColor()),
                    item.getSize(),
                    item.getQuantity() == null ? 0 : item.getQuantity(),
                    item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice(),
                    item.getTotalPrice() == null ? BigDecimal.ZERO : item.getTotalPrice());
        }

    }

    private static class CustomerGroup {
        private final List<Customer> customers = new ArrayList<>();
        private final List<Order> orders = new ArrayList<>();

        void add(Customer customer, List<Order> customerOrders) {
            customers.add(customer);
            orders.addAll(customerOrders);
        }

        CustomerResponse toResponse() {
            Customer latestCustomer = latestCustomer();
            List<AdminOrderResponse> orderResponses = orders.stream()
                    .sorted((first, second) -> orderCreatedAt(second).compareTo(orderCreatedAt(first)))
                    .map((Order order) -> AdminOrderResponse.from(order))
                    .toList();
            BigDecimal totalSpent = sumOrderTotals(orders);
            LocalDateTime lastOrder = latestOrderDate();

            return new CustomerResponse(
                    latestCustomer.getId(),
                    customerIds(),
                    CustomerResponse.customerName(latestCustomer),
                    latestCustomer.getEmail(),
                    firstNonBlank(latestCustomer.getPhone(), latestCustomer.getWhatsapp()),
                    orders.size(),
                    totalSpent,
                    lastOrder,
                    orderResponses);
        }

        private Customer latestCustomer() {
            Customer latestCustomer = null;
            LocalDateTime latestUpdatedAt = LocalDateTime.MIN;
            for (Customer customer : customers) {
                LocalDateTime updatedAt = customer.getUpdatedAt() == null ? LocalDateTime.MIN : customer.getUpdatedAt();
                if (latestCustomer == null || updatedAt.isAfter(latestUpdatedAt)) {
                    latestCustomer = customer;
                    latestUpdatedAt = updatedAt;
                }
            }
            return Objects.requireNonNull(latestCustomer, "Customer group must contain at least one customer");
        }

        private List<UUID> customerIds() {
            List<UUID> ids = new ArrayList<>();
            for (Customer customer : customers) {
                ids.add(customer.getId());
            }
            return ids;
        }

        private LocalDateTime latestOrderDate() {
            LocalDateTime latestOrder = null;
            for (Order order : orders) {
                LocalDateTime createdAt = order.getCreatedAt();
                if (createdAt != null && (latestOrder == null || createdAt.isAfter(latestOrder))) {
                    latestOrder = createdAt;
                }
            }
            return latestOrder;
        }

        private static LocalDateTime orderCreatedAt(Order order) {
            LocalDateTime createdAt = order.getCreatedAt();
            return createdAt == null ? LocalDateTime.MIN : createdAt;
        }
    }

    public record CustomerResponse(
            UUID id,
            List<UUID> customerIds,
            String name,
            String email,
            String phone,
            int ordersCount,
            BigDecimal totalSpent,
            LocalDateTime lastOrder,
            List<AdminOrderResponse> orders) {

        static String customerName(Customer customer) {
            String name = String.join(" ",
                    customer.getFirstName() == null ? "" : customer.getFirstName(),
                    customer.getLastName() == null ? "" : customer.getLastName()).trim();
            return name.isBlank() ? "Customer" : name;
        }

        LocalDateTime lastOrderSortValue() {
            return lastOrder == null ? LocalDateTime.MIN : lastOrder;
        }
    }

    public record ProductResponse(
            UUID id,
            String slug,
            ProductController.CategoryResponse category,
            String nameEn,
            String nameAr,
            String shortDescriptionEn,
            String shortDescriptionAr,
            String descriptionEn,
            String descriptionAr,
            BigDecimal price,
            BigDecimal salePrice,
            String badge,
            Boolean active,
            Boolean featuredMenu,
            Integer featuredMenuOrder,
            String videoUrl,
            List<ProductController.ProductImageResponse> images,
            List<ProductController.ProductVariantResponse> variants) {
        static ProductResponse from(Product product) {
            return new ProductResponse(
                    product.getId(),
                    product.getSlug(),
                    ProductController.CategoryResponse.from(product.getCategory()),
                    product.getNameEn(),
                    product.getNameAr(),
                    product.getShortDescriptionEn(),
                    product.getShortDescriptionAr(),
                    product.getDescriptionEn(),
                    product.getDescriptionAr(),
                    product.getPrice(),
                    product.getSalePrice(),
                    product.getBadge(),
                    product.getActive(),
                    product.getFeaturedMenu(),
                    product.getFeaturedMenuOrder(),
                    product.getVideoUrl(),
                    product.getImages().stream().map(ProductController.ProductImageResponse::from).toList(),
                    product.getVariants().stream().map(ProductController.ProductVariantResponse::from).toList());
        }
    }
}
