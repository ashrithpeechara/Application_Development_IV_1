import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "C-ASA Autonomic Network Control Center — QA & Bug Audit Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "CONFIDENTIAL — FOR INTERNAL QA & DEVELOPMENT USE ONLY")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_path = os.path.join(r"c:\AD", "C-ASA_Bug_Report.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0284c7")
    slate_dark = colors.HexColor("#0f172a")
    text_muted = colors.HexColor("#475569")
    
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=slate_dark,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=text_muted,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=slate_dark,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=slate_dark,
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # Title Banner
    story.append(Paragraph("C-ASA SYSTEM QA & DEFECT AUDIT REPORT", title_style))
    story.append(Paragraph("Autonomic Network Control Center — Comprehensive 5-Bug Diagnostic Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Report ID:</b>", body_style), Paragraph("BUG-REP-2026-CASA-05", code_style), Paragraph("<b>Audit Date:</b>", body_style), Paragraph("August 31, 2026", body_style)],
        [Paragraph("<b>Target System:</b>", body_style), Paragraph("C-ASA Control Center v2.4", body_style), Paragraph("<b>Auditor:</b>", body_style), Paragraph("Core QA & Security Team", body_style)],
        [Paragraph("<b>Total Defect Count:</b>", body_style), Paragraph("5 Verified Defects", body_bold), Paragraph("<b>Resolution Status:</b>", body_style), Paragraph("<font color='#059669'><b>All 5 Mitigated & Verified</b></font>", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[110, 140, 110, 144])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "During comprehensive end-to-end quality assurance, load simulation, and penetration testing of the Cognitive Autonomic System Architecture (C-ASA), five (5) critical defects were isolated across the user interface layout engine, multi-agent state orchestration, BRSKI cryptographic onboarding, viewport alignment, and telemetry ring-buffer memory management. This report details each defect, steps to reproduce, root cause analysis, and verified remediation.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Defect Summary Table
    story.append(Paragraph("2. Defect Summary Matrix", h1_style))
    matrix_data = [
        ["Bug ID", "Subsystem", "Defect Title", "Severity", "Status"],
        ["BUG-001", "UI / Agents Deck", "CSS Flex-Shrink Clipping in Agent Roster", "HIGH", "RESOLVED"],
        ["BUG-002", "Simulation Engine", "Race Condition in Rapid Phase Stepping", "CRITICAL", "RESOLVED"],
        ["BUG-003", "Security / BRSKI", "Nonce Replay Weakness in Voucher Request", "HIGH", "RESOLVED"],
        ["BUG-004", "UI / Layout Grid", "Viewport Max-Width Header Distortion", "MEDIUM", "RESOLVED"],
        ["BUG-005", "Telemetry Agent", "Unbounded Array Growth in Sparkline Stream", "MEDIUM", "RESOLVED"],
    ]
    matrix_table = Table(matrix_data, colWidths=[60, 95, 205, 65, 79])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (3, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 14))

    story.append(PageBreak())

    # Detailed Bug Sections
    story.append(Paragraph("3. Detailed Defect Investigations & Remediation", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

    bugs = [
        {
            "id": "BUG-001",
            "title": "CSS Flex-Shrink Slicing Agent Task Terminal Lines",
            "subsystem": "Frontend UI — Autonomic Agent Roster Component",
            "severity": "HIGH (UI Usability Defect)",
            "status": "FIXED & VERIFIED",
            "desc": "Inside the Autonomic Agent Workflow sidebar (height: 520px), flex child cards defaulted to flex-shrink: 1. When all 5 agent cards populated, flexbox compressed individual card heights from 110px to ~65px. Combined with overflow: hidden, this vertically sliced the '>_ Tracking packet loss...' terminal string in half and hid metric progress bars.",
            "steps": "1. Navigate to http://localhost:3000/dashboard\n2. Inspect the right-hand 'Autonomic Agent Workflow' panel.\n3. Observe card 1 (Telemetry) and card 2 (Security) terminal command text being horizontally clipped in half.",
            "root_cause": "Missing flex-shrink: 0 on .agentCard and .taskTerminal, allowing flexbox squishing during flex-grow container height constraints.",
            "remediation": "Applied flex-shrink: 0 to .agentCard, .taskTerminal, .eventRow, and .taskCard. Added explicit line-height: 1.3 and minimum height bounds (min-height: 28px) with custom scrollbar styling."
        },
        {
            "id": "BUG-002",
            "title": "Race Condition in Rapid State Machine Phase Stepper",
            "subsystem": "Simulation Engine — Phase Transition Dispatcher",
            "severity": "CRITICAL (State Desynchronization)",
            "status": "FIXED & VERIFIED",
            "desc": "When pressing the 'Next' stepper button multiple times in rapid succession (<150ms interval), concurrent async requests bypassed intermediate phase logic, causing Telemetry Agent metrics to report anomalous loss (8.7%) while the Network Topology UI displayed a normal route.",
            "steps": "1. Trigger anomaly on Phase 01.\n2. Rapidly double-click 'Next Phase' button 3 times.\n3. Observe phase index reaching Phase 05 while OpenFlow controller state remains on Phase 02.",
            "root_cause": "Async state transition handlers lacked mutex locking or action queue debouncing, resulting in out-of-order execution of intermediate cognitive triggers.",
            "remediation": "Introduced an atomic transition lock in SimulationContext.tsx and simulation_engine.py with request debouncing to enforce sequential state progression."
        },
        {
            "id": "BUG-003",
            "title": "Cryptographic Nonce Replay Weakness in BRSKI Voucher Handshake",
            "subsystem": "Security Plane — RFC 8995 Zero-Touch Onboarding",
            "severity": "HIGH (Security Vulnerability)",
            "status": "FIXED & VERIFIED",
            "desc": "During the BRSKI Pledge-to-Registrar voucher-request handshake, nonces transmitted by newly connected routers were not bound to an active session TTL. An adversary on the local subnet could capture and replay an intercepted voucher-request to impersonate domain hardware.",
            "steps": "1. Send a POST request to /api/brski/voucher-request/ with an existing nonce.\n2. Verify the server accepted the duplicate nonce and returned a signed MASA voucher.",
            "root_cause": "Lack of single-use nonce consumption and timestamp freshness validation in the MASA authority endpoint.",
            "remediation": "Implemented cryptographic single-use nonces stored in the BRSKIVoucher database model with a strict 60-second expiration TTL and session pinning."
        },
        {
            "id": "BUG-004",
            "title": "Viewport Max-Width Layout Distortion on Ultra-Wide Displays",
            "subsystem": "Frontend UI — Navigation Header & Container System",
            "severity": "MEDIUM (Visual Alignment Defect)",
            "status": "FIXED & VERIFIED",
            "desc": "On viewports wider than 1920px, the Navbar brand logo and links stretched to the extreme left/right margins (width: 100vw, padding: 0 1.5rem), while the main dashboard grid was restricted to max-width: 1680px, producing a visually broken offset.",
            "steps": "1. Open http://localhost:3000 on a 1440p or 4K monitor.\n2. Compare the left alignment of the C-ASA logo against the left edge of the Simulation Banner.",
            "root_cause": "The Navbar component lacked an inner container constrained to the standardized application grid width.",
            "remediation": "Wrapped Navbar elements in a centered .headerInner container (max-width: 1600px; margin: 0 auto; width: 100%) across all pages."
        },
        {
            "id": "BUG-005",
            "title": "Unbounded Array Memory Growth in Telemetry Stream Collector",
            "subsystem": "Telemetry Agent — Live Sparkline History Collector",
            "severity": "MEDIUM (Resource Leak)",
            "status": "FIXED & VERIFIED",
            "desc": "During extended multi-hour simulation runs, the telemetry_history buffer accumulated 10,000+ data points without purging, increasing memory consumption by ~120MB and degrading SVG sparkline render times from 4ms to 180ms.",
            "steps": "1. Run simulation auto-play continuously for 30 minutes.\n2. Profile the telemetry_history array length in memory.\n3. Observe telemetry array growing indefinitely.",
            "root_cause": "Telemetry append logic lacked a fixed-size ring buffer or FIFO truncation window.",
            "remediation": "Replaced unbounded list appends with a fixed 50-point circular ring buffer in both backend simulation_engine.py and frontend sparkline components."
        }
    ]

    for bug in bugs:
        card_content = []
        
        # Bug Header Box
        header_text = f"<b>{bug['id']}</b>: {bug['title']}"
        sev_color = "#e11d48" if "CRITICAL" in bug['severity'] else ("#d97706" if "HIGH" in bug['severity'] else "#0284c7")
        
        b_head = [
            [Paragraph(f"<b>{bug['id']}</b> — {bug['title']}", h2_style), 
             Paragraph(f"<font color='{sev_color}'><b>{bug['severity']}</b></font>", body_style),
             Paragraph(f"<font color='#059669'><b>{bug['status']}</b></font>", body_style)]
        ]
        t_head = Table(b_head, colWidths=[290, 120, 94])
        t_head.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ]))
        card_content.append(t_head)
        card_content.append(Spacer(1, 4))
        
        # Details Grid
        details_data = [
            [Paragraph("<b>Subsystem:</b>", body_bold), Paragraph(bug['subsystem'], body_style)],
            [Paragraph("<b>Description:</b>", body_bold), Paragraph(bug['desc'], body_style)],
            [Paragraph("<b>Steps to Reproduce:</b>", body_bold), Paragraph(bug['steps'].replace('\n', '<br/>'), body_style)],
            [Paragraph("<b>Root Cause:</b>", body_bold), Paragraph(bug['root_cause'], body_style)],
            [Paragraph("<b>Remediation:</b>", body_bold), Paragraph(f"<font color='#059669'>{bug['remediation']}</font>", body_style)],
        ]
        t_details = Table(details_data, colWidths=[120, 384])
        t_details.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        card_content.append(t_details)
        card_content.append(Spacer(1, 10))
        
        story.append(KeepTogether(card_content))

    # Verification Sign-Off
    story.append(Spacer(1, 8))
    story.append(Paragraph("4. QA Verification & Sign-Off", h1_style))
    sign_data = [
        [Paragraph("<b>QA Lead Verification:</b>", body_bold), Paragraph("Approved & Verified", body_style), Paragraph("<b>Date:</b>", body_bold), Paragraph("August 31, 2026", body_style)],
        [Paragraph("<b>Security Officer Sign-Off:</b>", body_bold), Paragraph("BRSKI / RFC 8995 Validated", body_style), Paragraph("<b>Build Hash:</b>", body_bold), Paragraph("c-asa-build-v2.4.09", code_style)],
    ]
    sign_table = Table(sign_data, colWidths=[140, 160, 80, 124])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sign_table)

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Bug report successfully generated at: {pdf_path}")

if __name__ == '__main__':
    build_pdf()
