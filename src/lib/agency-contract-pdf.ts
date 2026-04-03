import jsPDF from 'jspdf';
import { formatCnpj, formatCpf, formatPhone } from '@/lib/br-utils';

export interface AgencyContractData {
  agencyName: string;
  agencyCnpj?: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone?: string;
  responsibleCpf: string;
  address?: string;
  city?: string;
  state?: string;
  planName?: string;
  contractedPromoters?: number;
  pricePerPromoter?: number;
  organizationName?: string;
}

export function generateAgencyContractPdfBlob(data: AgencyContractData): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const today = new Date().toLocaleDateString('pt-BR');
  const monthlyAmount = (data.contractedPromoters || 0) * (data.pricePerPromoter || 0);
  let y = 18;

  doc.setFillColor(18, 22, 36);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.organizationName || 'Ayratech', pageWidth / 2, 24, { align: 'center' });
  doc.text(`Emitido em ${today}`, pageWidth / 2, 30, { align: 'center' });

  y = 44;
  y = drawTitle(doc, 'PARTES', margin, y, contentWidth);
  y = drawField(doc, 'Contratada', data.agencyName, margin, y, contentWidth);
  y = drawField(doc, 'CNPJ', formatCnpj(data.agencyCnpj || ''), margin, y, contentWidth);
  y = drawField(doc, 'Responsável', data.responsibleName, margin, y, contentWidth);
  y = drawField(doc, 'CPF do responsável', formatCpf(data.responsibleCpf), margin, y, contentWidth);
  y = drawField(doc, 'E-mail', data.responsibleEmail, margin, y, contentWidth);
  if (data.responsiblePhone) y = drawField(doc, 'Telefone', formatPhone(data.responsiblePhone), margin, y, contentWidth);
  if (data.address) y = drawField(doc, 'Endereço', data.address, margin, y, contentWidth);
  if (data.city || data.state) y = drawField(doc, 'Cidade/UF', [data.city, data.state].filter(Boolean).join('/'), margin, y, contentWidth);

  y += 4;
  y = drawTitle(doc, 'CONDIÇÕES COMERCIAIS', margin, y, contentWidth);
  y = drawField(doc, 'Plano', data.planName || 'Plano comercial vigente', margin, y, contentWidth);
  y = drawField(doc, 'Promotores contratados', String(data.contractedPromoters || 0), margin, y, contentWidth);
  y = drawField(doc, 'Valor por promotor', `R$ ${(data.pricePerPromoter || 0).toFixed(2)}`, margin, y, contentWidth);
  y = drawField(doc, 'Valor mensal estimado', `R$ ${monthlyAmount.toFixed(2)}`, margin, y, contentWidth);

  y += 6;
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const clauses = [
    `Pelo presente instrumento, a empresa ${data.organizationName || 'Ayratech'} e a agência ${data.agencyName} firmam contrato para operação de promotores em unidades e PDVs previamente autorizados no sistema.`,
    'A contratada declara que os promotores vinculados atuarão somente nas lojas, dias, horários e marcas liberados na plataforma, observando as regras operacionais de cada supermercado.',
    `A cobrança recorrente será calculada conforme o plano ${data.planName || 'vigente'}, considerando ${data.contractedPromoters || 0} promotor(es) contratado(s), no valor mensal estimado de R$ ${monthlyAmount.toFixed(2)}.`,
    'Em caso de inadimplência, o acesso dos promotores poderá ser bloqueado automaticamente, conforme políticas comerciais e operacionais cadastradas.',
    'Este documento poderá ser assinado eletronicamente, com validade jurídica, permanecendo disponível para auditoria e conferência no sistema.',
  ];

  clauses.forEach((clause, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${clause}`, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  });

  y += 10;
  doc.setDrawColor(140, 140, 140);
  doc.line(margin, y, margin + 74, y);
  doc.line(pageWidth - margin - 74, y, pageWidth - margin, y);
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(data.organizationName || 'Ayratech', margin, y + 5);
  doc.text(data.responsibleName, pageWidth - margin - 74, y + 5);
  doc.text('Contratante', margin, y + 10);
  doc.text(`CPF: ${formatCpf(data.responsibleCpf)}`, pageWidth - margin - 74, y + 10);

  return doc.output('blob');
}

function drawTitle(doc: jsPDF, title: string, x: number, y: number, width: number) {
  doc.setFillColor(244, 246, 250);
  doc.roundedRect(x, y, width, 8, 2, 2, 'F');
  doc.setTextColor(18, 22, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, x + 3, y + 5.5);
  return y + 12;
}

function drawField(doc: jsPDF, label: string, value: string, x: number, y: number, width: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(88, 94, 112);
  doc.text(`${label}:`, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 34, 34);
  const lines = doc.splitTextToSize(value || '—', width - 42);
  doc.text(lines, x + 42, y);
  return y + lines.length * 4 + 2;
}
