package com.ruzo.backend;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruzo.backend.service.EmailNotificationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "ruzo.admin.email=admin-hero-test@example.invalid",
        "ruzo.admin.password=initial-test-password"
})
@AutoConfigureMockMvc
class AdminHomepageFlowTest {
    private static final String EMAIL = "admin-hero-test@example.invalid";
    private static final String LOGIN_REQUEST = """
            {"email":"ADMIN-HERO-TEST@example.invalid","password":"%s"}
            """;

    @Autowired
    private MockMvc mvc;
    @Autowired
    private ObjectMapper json;
    @MockitoBean
    private EmailNotificationService mail;

    @Test
    void adminCanManageSecondHeroAndResetPasswordWithoutLeavingOldSessionsValid() throws Exception {
        mvc.perform(get("/api/admin/homepage")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/homepage").header(HttpHeaders.AUTHORIZATION, "Bearer ruzo-admin-token"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/products")).andExpect(status().isOk());
        mvc.perform(get("/api/homepage")).andExpect(status().isOk())
                .andExpect(jsonPath("$.secondaryHero").doesNotExist());

        String session = login("initial-test-password");
        String bearer = "Bearer " + session;
        mvc.perform(put("/api/admin/homepage/secondary").header(HttpHeaders.AUTHORIZATION, bearer)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"discoverUrl":"/collections/sets","enabled":true}
                        """)).andExpect(status().isBadRequest());

        String uploaded = mvc.perform(post("/api/admin/homepage/media").header(HttpHeaders.AUTHORIZATION, bearer)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"mediaType":"IMAGE","mediaUrl":"/hero-ruzo-poster.webp","originalFileName":"cover.webp"}
                        """)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String mediaId = json.readTree(uploaded).path("id").asText();
        mvc.perform(put("/api/admin/homepage/secondary").header(HttpHeaders.AUTHORIZATION, bearer)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"discoverUrl":"/collections/sets","enabled":true,"activeHeroMediaId":"%s"}
                        """.formatted(mediaId))).andExpect(status().isOk());
        mvc.perform(get("/api/homepage")).andExpect(status().isOk())
                .andExpect(jsonPath("$.discoverUrl").value("/collections/all"))
                .andExpect(jsonPath("$.secondaryHero.discoverUrl").value("/collections/sets"))
                .andExpect(jsonPath("$.secondaryHero.heroMedia.id").value(mediaId));
        mvc.perform(put("/api/admin/homepage/secondary").header(HttpHeaders.AUTHORIZATION, bearer)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"discoverUrl":"/collections/sets","enabled":false}
                        """)).andExpect(status().isOk())
                .andExpect(jsonPath("$.secondaryHero.heroMedia.id").value(mediaId));
        mvc.perform(get("/api/homepage")).andExpect(jsonPath("$.secondaryHero").doesNotExist());

        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"unknown@example.invalid\"}")).andExpect(status().isAccepted());
        verifyNoInteractions(mail);
        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\"}")).andExpect(status().isAccepted());
        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\"}")).andExpect(status().isAccepted());
        ArgumentCaptor<String> resetToken = ArgumentCaptor.forClass(String.class);
        verify(mail).sendAdminPasswordReset(eq(EMAIL), resetToken.capture());
        String resetRequest = """
                {"token":"%s","password":"updated-test-password"}
                """.formatted(resetToken.getValue());
        mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content(resetRequest))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON).content(resetRequest))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/admin/homepage").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_REQUEST.formatted("initial-test-password"))).andExpect(status().isUnauthorized());

        String newSession = login("updated-test-password");
        assertNotEquals(session, newSession);
        String newBearer = "Bearer " + newSession;
        mvc.perform(post("/api/auth/logout").header(HttpHeaders.AUTHORIZATION, newBearer))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/homepage").header(HttpHeaders.AUTHORIZATION, newBearer))
                .andExpect(status().isUnauthorized());
    }

    private String login(String password) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_REQUEST.formatted(password)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value(EMAIL))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).path("token").asText();
    }
}
