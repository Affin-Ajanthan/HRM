package com.affin.hrm.Util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility for generating and testing BCrypt password hashes.
 * Run this class directly to generate hashes for initial data setup.
 */
public class PasswordUtil {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("=== BCrypt Password Generator ===\n");

        String[] passwords = {"admin123", "hr123", "employee123", "test123", "password"};
        for (String pass : passwords) {
            String encoded = encoder.encode(pass);
            System.out.println("Password : " + pass);
            System.out.println("BCrypt   : " + encoded);
            System.out.println("Verify   : " + encoder.matches(pass, encoded));
            System.out.println();
        }
    }
}
