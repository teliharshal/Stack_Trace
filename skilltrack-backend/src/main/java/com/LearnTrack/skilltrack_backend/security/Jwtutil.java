//package com.LearnTrack.skilltrack_backend.security;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.stereotype.Component;
//
//import javax.crypto.SecretKey;
//import java.util.Date;
//
//@Component
//public class Jwtutil {
//
//    private final SecretKey SECRET_KEY =
//            Keys.hmacShaKeyFor("skilltrack_secret_key_very_secure_12345".getBytes());
//
////    System.out.println("Token received: " + SECRET_KEY);
//
//    // Generate token
//    public String generateToken(String email, String role) {
//
//        return Jwts.builder()
//                .setSubject(email)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
//                .signWith(SECRET_KEY)
//                .compact();
//    }
//
//    // Extract email
//    public String extractEmail(String token) {
//
//        Claims claims = Jwts.parserBuilder()
//                .setSigningKey(SECRET_KEY)
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//
//        return claims.getSubject();
//    }
//
//    // Extract role
//    public String extractRole(String token) {
//
//        Claims claims = Jwts.parserBuilder()
//                .setSigningKey(SECRET_KEY)
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//
//        return claims.get("role", String.class);
//    }
//}