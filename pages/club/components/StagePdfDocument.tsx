import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registramos una fuente estándar (opcional, usa Helvetica por defecto que queda bien)
// Si quisieras fuentes custom, se registran aquí.

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
    fontFamily: 'Helvetica',
  },
  // HERO SECTION
  heroContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Un degradado oscuro fake
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#f59e0b', // Amber 500
    color: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'black',
    alignSelf: 'flex-start',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // CONTENT
  contentContainer: {
    padding: 30,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0f172a', // Slate 900
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    borderBottom: '2px solid #f59e0b',
    paddingBottom: 6,
    width: '100%',
  },
  description: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 20,
    marginTop: 10,
  },

  // TIMELINE
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
  },
  dayBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginRight: 10,
  },
  dayTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  
  activityRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 15,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 14, // Center of the dot
    top: 5,
    bottom: -15,
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  timeBox: {
    width: 50,
    paddingRight: 10,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#f59e0b',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginRight: 10,
    marginTop: 2,
    zIndex: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 10,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  }
});

// Componente del Documento
export default function StagePdfDocument({ stage, activities }: { stage: any, activities: any[] }) {
  
  // Agrupar actividades por día para el PDF (similar a como hicimos en el front)
  const groupedDays = activities; // Ya vienen agrupadas desde el componente padre

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER / BANNER */}
        <View style={styles.heroContainer}>
          {stage.banner_url && (
            <Image src={stage.banner_url} style={styles.heroImage} />
          )}
          <View style={styles.heroOverlay}>
            <Text style={styles.tag}>STAGE EXPERIENCE</Text>
            <Text style={styles.title}>{stage.nombre}</Text>
            <Text style={styles.subtitle}>
              {stage.lugar}  •  {stage.fecha_inicio} / {stage.fecha_fin}
            </Text>
          </View>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.contentContainer}>
          
          <Text style={styles.sectionTitle}>Resumen del Viaje</Text>
          <Text style={styles.description}>{stage.descripcion}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Itinerario Oficial</Text>

          {groupedDays.map((dia: any, idx: number) => (
            <View key={idx} wrap={false}> 
              {/* wrap={false} evita que un día se corte a la mitad entre páginas si es posible */}
              
              <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                  <Text>{dia.dia_numero}</Text>
                </View>
                <View>
                  <Text style={styles.dayTitle}>Agenda del Día</Text>
                </View>
              </View>

              {dia.actividades.map((act: any, aIdx: number) => (
                <View key={aIdx} style={styles.activityRow}>
                  {/* Línea vertical conectora (visual) */}
                  {aIdx < dia.actividades.length - 1 && <View style={styles.timelineLine} />}
                  
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{act.hora_inicio?.substring(0, 5)}</Text>
                  </View>
                  
                  <View style={styles.dot} />
                  
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>{act.titulo}</Text>
                    {act.subtitulo && <Text style={styles.cardSubtitle}>{act.subtitulo}</Text>}
                    {act.ubicacion && (
                      <Text style={styles.cardLocation}>📍 {act.ubicacion}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generado por TeamFlow Platform</Text>
          <Text style={styles.footerText}>Documento Oficial - {new Date().toLocaleDateString()}</Text>
        </View>

      </Page>
    </Document>
  );
}