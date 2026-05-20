package com.LearnTrack.skilltrack_backend.service;

//import com.LearnTrack.skilltrack_backend.entity.Admin;
import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
//import com.LearnTrack.skilltrack_backend.repository.AdminRepository;
import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminServices {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public EmployeeEntity login(String email, String rawPassword) {
        EmployeeEntity user = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🛠️ GENERATE A NEW HASH RIGHT NOW
        String newHash = passwordEncoder.encode("admin123");
        System.out.println("FRESH HASH FOR admin123: " + newHash);

        boolean isMatch = passwordEncoder.matches(rawPassword, user.getPassword());
        System.out.println("Does it match? " + isMatch);

        if (!isMatch) {
            throw new RuntimeException("Invalid password");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Access denied: admin privileges required");
        }

        return user;
    }

    public ByteArrayInputStream generateEmployeeReport(List<EmployeeEntity> employees) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employee Report");

            // --- 1. DEFINE STYLES ---

            // Title Style (Blue, Bold, Large)
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Subtitle Style (Timestamp - Italic)
            CellStyle subTitleStyle = workbook.createCellStyle();
            Font subFont = workbook.createFont();
            subFont.setItalic(true);
            subTitleStyle.setFont(subFont);
            subTitleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Table Header Style (Purple Background, White Text, Borders)
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LAVENDER.getIndex()); // Closest to UI
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            // Data Cell Style (Borders)
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);


            // ✅ VERIFIED (Green)
            CellStyle verifiedStyle = workbook.createCellStyle();
            verifiedStyle.cloneStyleFrom(dataStyle);
            verifiedStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            verifiedStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ✅ REJECTED (Red)
            CellStyle rejectedStyle = workbook.createCellStyle();
            rejectedStyle.cloneStyleFrom(dataStyle);
            rejectedStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            rejectedStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ✅ SUBMITTED (Yellow)
            CellStyle submittedStyle = workbook.createCellStyle();
            submittedStyle.cloneStyleFrom(dataStyle);
            submittedStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            submittedStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // --- 2. CREATE LAYOUT ---

            // Main Title Row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("CODEVERGE SKILLTRACK - EMPLOYEE PROGRESS REPORT");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 11));

            // Generated Date Row
            Row dateRow = sheet.createRow(1);
            Cell dateCell = dateRow.createCell(0);
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            dateCell.setCellValue("Generated on: " + now.format(formatter));
            dateCell.setCellStyle(subTitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 11));

            // Empty row for spacing (Optional, UI looks tight)

            // Table Header
            String[] columns = {
                    "Employee ID",
                    "Name",
                    "Email",
                    "Skill Name",
                    "Category",
                    "Progress (%)",
                    "Certificate Uploaded",
                    "Certificate Verified",
                    "Test Status",
                    "Score",
                    "Result Link"
            };

            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- 3. FILL DATA ---
            int rowNum = 4;

            for (EmployeeEntity emp : employees) {

                List<SkillAssignment> assignments =
                        skillAssignmentRepository.findByEmployeeId(emp.getId());

                int startRow = rowNum; // ✅ track start for this employee

                for (SkillAssignment a : assignments) {

                    Row row = sheet.createRow(rowNum++);

                    createStyledCell(row, 0, String.valueOf(emp.getId()), dataStyle);
                    createStyledCell(row, 1, emp.getName(), dataStyle);
                    createStyledCell(row, 2, emp.getEmail(), dataStyle);

                    createStyledCell(row, 3, a.getSkill().getSkillName(), dataStyle);
                    createStyledCell(row, 4, a.getSkill().getCategory(), dataStyle);
                    createStyledCell(row, 5, a.getProgress() + "%", dataStyle);

                    createStyledCell(row, 6,
                            Boolean.TRUE.equals(a.getCertificateUploaded()) ? "Yes" : "No",
                            dataStyle
                    );

                    createStyledCell(row, 7,
                            Boolean.TRUE.equals(a.getCertificateVerified()) ? "Yes" : "No",
                            dataStyle
                    );

                    String status = a.getTestStatus() != null ? a.getTestStatus() : "NOT_ASSIGNED";

                    CellStyle statusStyle = dataStyle;

                    if ("VERIFIED".equalsIgnoreCase(status)) {
                        statusStyle = verifiedStyle;
                    } else if ("REJECTED".equalsIgnoreCase(status)) {
                        statusStyle = rejectedStyle;
                    } else if ("SUBMITTED".equalsIgnoreCase(status)) {
                        statusStyle = submittedStyle;
                    }

                    createStyledCell(row, 8, status, statusStyle);

                    createStyledCell(row, 9,
                            a.getTestScore() != null ? String.valueOf(a.getTestScore()) : "-",
                            dataStyle
                    );

                    createStyledCell(row, 10,
                            a.getResultLink() != null ? a.getResultLink() : "-",
                            dataStyle
                    );
                }

                // ✅ MERGE AFTER EACH EMPLOYEE BLOCK
                if (assignments.size() > 1) {
                    sheet.addMergedRegion(new CellRangeAddress(startRow, rowNum - 1, 0, 0));
                    sheet.addMergedRegion(new CellRangeAddress(startRow, rowNum - 1, 1, 1));
                    sheet.addMergedRegion(new CellRangeAddress(startRow, rowNum - 1, 2, 2));
                }
            }
            // Auto-size columns for better readability
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report", e);
        }
    }

    // Updated Helper method to handle CellStyle
    private void createStyledCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    @Transactional
    public void deleteEmployee(Long id) {

        // ✅ DEBUG (IMPORTANT)
        System.out.println("Deleting employee: " + id);

        // 1️⃣ delete child tables FIRST
        employeeSkillRepository.deleteByEmployeeId(id);
        skillAssignmentRepository.deleteByEmployeeId(id);

        // 2️⃣ NOW delete employee
        employeeRepository.deleteById(id);
    }
}
