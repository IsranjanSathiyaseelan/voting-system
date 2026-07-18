package com.cloudnative.voting.service;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.VoteRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Generates PDF (OpenPDF 2.x using com.lowagie namespace) and Excel (Apache POI) reports for election results.
 * Reuses Vote and Candidate data — no separate reporting tables.
 */
@Service
@Transactional(readOnly = true)
public class ReportService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;

    public ReportService(ElectionRepository electionRepository,
                         CandidateRepository candidateRepository,
                         VoteRepository voteRepository) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
    }

    /**
     * Generate an Excel report for a given election.
     * Validates the election belongs to the caller's org.
     */
    public byte[] generateExcelReport(Long electionId, Long organizationId) {
        Election election = getValidatedElection(electionId, organizationId);
        List<Candidate> candidates = candidateRepository.findByElection_IdOrderByVoteCountDesc(electionId);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Election Results");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Title row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("VoteSecure — Election Results: " + election.getTitle());

            // Header row
            Row headerRow = sheet.createRow(2);
            String[] headers = {"#", "Candidate Name", "Votes", "Percentage"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            long totalVotes = voteRepository.countByElectionId(electionId);

            // Data rows
            int rowNum = 3;
            int rank = 1;
            for (Candidate c : candidates) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rank++);
                row.createCell(1).setCellValue(c.getName());
                row.createCell(2).setCellValue(c.getVoteCount());
                double pct = totalVotes > 0 ? (c.getVoteCount() * 100.0 / totalVotes) : 0;
                row.createCell(3).setCellValue(String.format("%.1f%%", pct));
            }

            // Summary row
            Row totalRow = sheet.createRow(rowNum + 1);
            totalRow.createCell(0).setCellValue("Total Votes:");
            totalRow.createCell(2).setCellValue(totalVotes);

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate Excel report");
        }
    }

    /**
     * Generate a PDF report using OpenPDF 2.x (com.lowagie package).
     * Validates the election belongs to the caller's org.
     */
    public byte[] generatePdfReport(Long electionId, Long organizationId) {
        Election election = getValidatedElection(electionId, organizationId);
        List<Candidate> candidates = candidateRepository.findByElection_IdOrderByVoteCountDesc(electionId);
        long totalVotes = voteRepository.countByElectionId(electionId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.NORMAL, Color.DARK_GRAY);
            Paragraph title = new Paragraph("VoteSecure — Election Results", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 13);
            Paragraph subtitle = new Paragraph(election.getTitle(), subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, Color.WHITE);
            String[] headers = {"Rank", "Candidate", "Votes", "Percentage"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headFont));
                cell.setBackgroundColor(new Color(30, 58, 138));
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            int rank = 1;
            for (Candidate c : candidates) {
                double pct = totalVotes > 0 ? (c.getVoteCount() * 100.0 / totalVotes) : 0;
                table.addCell(new PdfPCell(new Phrase(String.valueOf(rank++), rowFont)));
                table.addCell(new PdfPCell(new Phrase(c.getName(), rowFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(c.getVoteCount()), rowFont)));
                table.addCell(new PdfPCell(new Phrase(String.format("%.1f%%", pct), rowFont)));
            }
            document.add(table);

            // Summary
            Font sumFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Paragraph summary = new Paragraph("\nTotal Votes Cast: " + totalVotes, sumFont);
            summary.setSpacingBefore(15);
            document.add(summary);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF report: " + e.getMessage());
        }
    }

    private Election getValidatedElection(Long electionId, Long organizationId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));
        if (!election.getOrganization().getId().equals(organizationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
        }
        return election;
    }
}
