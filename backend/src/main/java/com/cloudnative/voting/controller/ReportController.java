package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Report generation controller.
 * Exports election results as PDF or Excel file downloads.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/elections/{electionId}/export/excel")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long electionId) {
        Long orgId = SecurityUtils.getCurrentOrganizationId();
        byte[] data = reportService.generateExcelReport(electionId, orgId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"election-" + electionId + "-results.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/elections/{electionId}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long electionId) {
        Long orgId = SecurityUtils.getCurrentOrganizationId();
        byte[] data = reportService.generatePdfReport(electionId, orgId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"election-" + electionId + "-results.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
