// src/components/documents/EntryReceipt.tsx
"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ReceiptData } from "@/types/business";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#FFFFFF", fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottom: 1, borderBottomColor: "#EEE", paddingBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#ea580c", textTransform: "uppercase", borderBottom: 1, borderBottomColor: "#ea580c", paddingBottom: 2 },
  grid: { flexDirection: "row", gap: 20, marginBottom: 15 },
  col: { flex: 1 },
  label: { color: "#666", fontSize: 9 },
  value: { fontWeight: "bold", marginBottom: 5, fontSize: 10 },
  checklistGrid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 5, marginBottom: 15 },
  checkItem: { width: "33%", flexDirection: "row", marginBottom: 5, alignItems: "center" },
  checkbox: { width: 10, height: 10, border: 1, borderColor: "#000", marginRight: 5 },
  notesBox: { padding: 10, backgroundColor: "#F1F5F9", minHeight: 60, borderRadius: 5 },
  footer: { marginTop: 30, borderTop: 1, borderTopColor: "#EEE", paddingTop: 10, fontSize: 7, color: "#999", textAlign: "center" },
  signatureBox: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", width: 160, textAlign: "center", paddingTop: 5, fontSize: 9 }
});

export const EntryReceipt = ({ data }: { data: ReceiptData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>GT SERVICE</Text>
          <Text>Meccanotronica di Giovanni Tambuscio</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>CHECK-IN VEICOLO</Text>
          <Text>Data: {data.date}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{data.customerName}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Veicolo / Targa:</Text>
          <Text style={styles.value}>{data.vehicle} ({data.plate})</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>KM:</Text>
          <Text style={styles.value}>{data.km}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Stato del Veicolo all&apos;accettazione</Text>
      <View style={styles.checklistGrid}>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Carrozzeria OK</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Cristalli OK</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Spie accese</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Anomalie Riscontrate / Note</Text>
      <View style={styles.notesBox}>
        <Text>{data.problemDescription || "Nessuna nota aggiuntiva."}</Text>
      </View>

      <View style={styles.signatureBox}>
        <View>
          <View style={styles.signatureLine} />
          <Text>Firma Cliente</Text>
        </View>
        <View>
          <View style={styles.signatureLine} />
          <Text>Firma Responsabile</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>GT Service Jonadi (VV) - Documento generato digitalmente.</Text>
      </View>
    </Page>
  </Document>
);