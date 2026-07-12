package com.ruzo.backend.controller;

import com.ruzo.backend.dto.CreateOrderRequest;
import com.ruzo.backend.entity.Order;
import com.ruzo.backend.entity.OrderStatus;
import com.ruzo.backend.service.OrderService;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponse createOrder(@RequestBody CreateOrderRequest request) {
        return OrderResponse.from(orderService.createOrder(request));
    }

    public record OrderResponse(
            UUID id,
            String orderNumber,
            OrderStatus status,
            BigDecimal subtotal,
            BigDecimal deliveryFee,
            BigDecimal total
    ) {
        static OrderResponse from(Order order) {
            return new OrderResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getStatus(),
                    order.getSubtotal(),
                    order.getDeliveryFee(),
                    order.getTotal()
            );
        }
    }
}
