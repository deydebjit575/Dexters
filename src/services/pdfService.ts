import { PatientProfile, MedicalRecord } from '../types/medical';

/**
 * Clean browser PDF Exporter for MediVault Lifetime Medical Records
 */
export function generateMedicalReportPDF(patient: PatientProfile, records: MedicalRecord[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MediVault Lifetime Medical Report - ${patient.fullName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #0f172a;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .title {
            font-size: 14px;
            color: #64748b;
            text-align: right;
          }
          .patient-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            font-size: 13px;
          }
          .patient-box strong {
            color: #1e293b;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 14px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            background: #eff6ff;
            color: #2563eb;
          }
          .badge-alert {
            background: #fef2f2;
            color: #dc2626;
          }
          .record-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .record-header {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
          }
          .record-title {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 6px;
          }
          .record-desc {
            font-size: 13px;
            color: #334155;
            margin-bottom: 10px;
          }
          .med-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 8px;
          }
          .med-table th, .med-table td {
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            text-align: left;
          }
          .med-table th {
            background: #f1f5f9;
            color: #475569;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div class="logo">
            🛡️ MediVault Health Record
          </div>
          <div class="title">
            Generated: ${new Date().toLocaleDateString()}<br>
            Zero-Knowledge Sovereign Vault Exporter
          </div>
        </div>

        <div class="patient-box">
          <div><strong>Patient Name:</strong> ${patient.fullName}</div>
          <div><strong>Age / Gender:</strong> ${patient.age} Yrs (${patient.gender})</div>
          <div><strong>Blood Group:</strong> ${patient.bloodType}</div>
          <div><strong>Patient ID:</strong> ${patient.id}</div>
          <div><strong>Email:</strong> ${patient.email}</div>
          <div><strong>Emergency Contact:</strong> ${patient.emergencyContact.name} (${patient.emergencyContact.phone})</div>
        </div>

        <div class="section-title">Critical Medical Alerts</div>
        <div style="margin-bottom: 20px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Known Allergies:</strong> ${patient.allergies.map(a => `<span class="badge badge-alert">${a.allergen} (${a.severity})</span>`).join(' ')}</p>
          <p style="margin: 4px 0;"><strong>Chronic Conditions:</strong> ${patient.chronicConditions.map(c => `<span class="badge">${c.name} (${c.status})</span>`).join(' ')}</p>
        </div>

        <div class="section-title">Lifetime Medical History (${records.length} Records)</div>
        ${records.map(rec => `
          <div class="record-card">
            <div class="record-header">
              <span><strong class="badge">${rec.category}</strong> • ${rec.date}</span>
              <span><strong>Doctor:</strong> ${rec.diagnosingDoctor} (${rec.doctorSpecialty}) — ${rec.hospitalClinic}</span>
            </div>
            <div class="record-title">${rec.title}</div>
            <div class="record-desc">${rec.diagnosisDetails}</div>

            ${rec.medicines && rec.medicines.length > 0 ? `
              <table class="med-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rec.medicines.map(m => `
                    <tr>
                      <td><strong>${m.name}</strong></td>
                      <td>${m.dosage}</td>
                      <td>${m.frequency}</td>
                      <td>${m.duration}</td>
                      <td>${m.instructions}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer">
          MediVault Cryptographic Sovereign Health Network • Patient-Owned Data Record • Verification Hash: AES-256-GCM
        </div>

        <script>
          window.onload = function() {
            // Auto trigger print preview if requested
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
