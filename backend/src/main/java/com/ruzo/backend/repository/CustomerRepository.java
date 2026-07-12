package com.ruzo.backend.repository;

import com.ruzo.backend.entity.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findFirstByEmailIgnoreCase(String email);

    Optional<Customer> findFirstByPhone(String phone);

    Optional<Customer> findFirstByWhatsapp(String whatsapp);
}
