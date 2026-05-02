package com.affin.hrm.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            System.out.println("[JWT_FILTER] Processing request: " + request.getRequestURI());
            System.out.println("[JWT_FILTER] JWT Token found: " + (StringUtils.hasText(jwt) ? "YES" : "NO"));

            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                System.out.println("[JWT_FILTER] Token validation: PASSED");
                String email = jwtUtil.getEmailFromToken(jwt);
                System.out.println("[JWT_FILTER] Email extracted: " + email);
                String role = jwtUtil.getRoleFromToken(jwt);
                System.out.println("[JWT_FILTER] Role extracted: " + role);

                if (StringUtils.hasText(role)) {
                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    System.out.println("[JWT_FILTER] Authority constructed: " + authority);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of((GrantedAuthority) () -> authority)
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    System.out.println("[JWT_FILTER] Authentication set with role claim (no DB lookup)");

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    filterChain.doFilter(request, response);
                    return;
                }

                System.out.println("[JWT_FILTER] Role claim missing, falling back to DB lookup");
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                System.out.println("[JWT_FILTER] Authentication set from DB lookup");

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.out.println("[JWT_FILTER] Token validation: FAILED or token not present");
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
            System.err.println("[JWT_FILTER] ERROR: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
