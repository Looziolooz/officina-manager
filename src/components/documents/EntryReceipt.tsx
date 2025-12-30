// src/components/documents/EntryReceipt.tsx (Versione Aggiornata)
"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#FFFFFF", fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, borderBottom: 1, borderBottomColor: "#EEE", paddingBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#ea580c", textTransform: "uppercase", borderBottom: 1, borderBottomColor: "#ea580c", paddingBottom: 2 },
  grid: { flexDirection: "row", gap: 20, marginBottom: 15 },
  col: { flex: 1 },
  label: { color: "#666", fontSize: 9 },
  value: { fontWeight: "bold", marginBottom: 5, fontSize: 10 },
  
  // Stili per la Check-list
  checklistGrid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 5, marginBottom: 15 },
  checkItem: { width: "33%", flexDirection: "row", marginBottom: 5, alignItems: "center" },
  checkbox: { width: 10, height: 10, border: 1, borderColor: "#000", marginRight: 5 },
  
  notesBox: { padding: 10, backgroundColor: "#F1F5F9", minHeight: 60, borderRadius: 5 },
  footer: { marginTop: 30, borderTop: 1, borderTopColor: "#EEE", pt: 10, fontSize: 7, color: "#999", textAlign: "center" },
  signatureBox: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", width: 160, textAlign: "center", paddingTop: 5, fontSize: 9 }
});

export const EntryReceipt = ({ data, checklist }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header (stesso di prima) */}
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>GT SERVICE</Text>
          <Text>Meccanotronica di Giovanni Tambuscio</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>CHECK-IN VEICOLO</Text>
          <Text>Data: {new Date().toLocaleDateString('it-IT')}</Text>
        </View>
      </View>

      {/* Dati Veicolo */}
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
          <Text style={styles.label}>KM all&apos;entrata:</Text>
          <Text style={styles.value}>{data.km}</Text>
        </View>
      </View>

      {/* NUOVA SEZIONE: CHECK-LIST STATO D'USO */}
      <Text style={styles.sectionTitle}>Stato del Veicolo all&apos;accettazione</Text>
      [Image of a professional vehicle inspection checklist diagram for automotive workshops]
      <View style={styles.checklistGrid}>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Carrozzeria OK</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Cristalli OK</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Ruota di scorta</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Spie accese</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Luci/Frecce OK</Text></View>
        <View style={styles.checkItem}><View style={styles.checkbox} /><Text>Documenti a bordo</Text></View>
      </View>

      {/* Livello Carburante (Visuale) */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.label}>Livello Carburante:</Text>
        <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
          <Text style={{ fontSize: 8, border: 1, padding: 3 }}>Riserva</Text>
          <Text style={{ fontSize: 8, border: 1, padding: 3 }}>1/4</Text>
          <Text style={{ fontSize: 8, border: 1, padding: 3, backgroundColor: "#EEE" }}>1/2</Text>
          <Text style={{ fontSize: 8, border: 1, padding: 3 }}>3/4</Text>
          <Text style={{ fontSize: 8, border: 1, padding: 3 }}>Pieno</Text>
        </View>
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
          <Text>Firma Giovanni Tambuscio</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>GT Service Jonadi (VV) - Responsabilità limitata ai lavori eseguiti. Si declina ogni responsabilità per oggetti lasciati nel veicolo.</Text>
      </View>
    </Page>
  </Document>
);