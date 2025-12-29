import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFFE57373); // Warm Red/Pink
  static const Color secondaryColor = Color(0xFFFFCCBC); // Light Orange
  static const Color backgroundColor = Color(0xFFFAFAFA); // Off-white
  static const Color textColor = Color(0xFF37474F); // Dark Blue Grey for readability

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      colorScheme: ColorScheme.fromSwatch().copyWith(
        primary: primaryColor,
        secondary: secondaryColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textColor),
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, color: textColor),
        bodyLarge: TextStyle(fontSize: 18, color: textColor), // Larger key text
        bodyMedium: TextStyle(fontSize: 16, color: textColor),
        labelLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white), // Button text
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.grey),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.grey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: const TextStyle(fontSize: 16, color: Colors.grey),
      ),
    );
  }
}
